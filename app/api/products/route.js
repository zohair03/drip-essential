import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Brand from "@/lib/models/Brand";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

const productCreateSchema = z.object({
  name: z.string().min(1, "Product name is required").trim(),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  image: z.string().optional().default(""),
  imagePublicId: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  imagePublicIds: z.array(z.string()).optional().default([]),
  status: z.enum(["Active", "Draft"]).optional().default("Active"),
  order: z.coerce.number().int().optional(),
  // R2 fields (optional — present for new uploads, absent for existing Cloudinary products)
  r2Image: z.string().nullable().optional(),
  r2ImageStandard: z.string().nullable().optional(),
  r2ImageFull: z.string().nullable().optional(),
  r2Key: z.string().nullable().optional(),
  r2KeyStandard: z.string().nullable().optional(),
  r2KeyFull: z.string().nullable().optional(),
  r2Images: z.array(z.string()).optional().default([]),
  r2ImagesStandard: z.array(z.string()).optional().default([]),
  r2ImagesFull: z.array(z.string()).optional().default([]),
  r2Keys: z.array(z.string()).optional().default([]),
  r2KeysStandard: z.array(z.string()).optional().default([]),
  r2KeysFull: z.array(z.string()).optional().default([]),
});

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const brandParam = searchParams.get("brand")?.trim();
    const statusParam = searchParams.get("status")?.trim();
    const sortParam = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const admin = await getAuthenticatedAdmin(request);
    const isAdminReq = (admin || searchParams.get("admin") === "true");

    const rawLimit = searchParams.get("limit");
    const isAll = searchParams.get("all") === "true" || rawLimit === "all";
    const parsedLimit = parseInt(rawLimit || "50", 10);
    const maxLimit = isAdminReq ? 1000 : 200;
    const limit = isAll ? 1000 : Math.min(maxLimit, Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit));

    // Query filter
    const query = {};

    // Status filter: Public can ONLY see Active products
    if (admin && statusParam) {
      if (statusParam === "all") {
        // no status constraint for admin
      } else {
        query.status = statusParam;
      }
    } else if (admin && searchParams.get("admin") === "true") {
      // Admin dashboard requesting all products
    } else {
      query.status = "Active";
    }

    // Brand filter (supports single brand or comma-separated list)
    if (brandParam) {
      const brandList = brandParam
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      const objectIds = brandList.filter((b) => mongoose.Types.ObjectId.isValid(b));
      const namesOrSlugs = brandList.filter((b) => !mongoose.Types.ObjectId.isValid(b));

      let matchedBrandIds = [...objectIds];

      const lookupConditions = [];
      if (namesOrSlugs.length > 0) {
        lookupConditions.push(
          ...namesOrSlugs.flatMap((b) => [
            { name: { $regex: new RegExp(`^${b}$`, "i") } },
            { slug: b.toLowerCase() },
          ])
        );
      }
      if (objectIds.length > 0) {
        lookupConditions.push({
          _id: { $in: objectIds.map((id) => new mongoose.Types.ObjectId(id)) },
        });
      }

      if (lookupConditions.length > 0) {
        const brandDocs = await Brand.find({ $or: lookupConditions }).select("_id name");
        matchedBrandIds = Array.from(
          new Set([
            ...matchedBrandIds,
            ...brandDocs.map((b) => b._id.toString()),
          ])
        );
      }

      if (matchedBrandIds.length > 0) {
        const idStrings = matchedBrandIds.map((id) => id.toString());
        const idObjects = matchedBrandIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));

        query.brand = { $in: [...idStrings, ...idObjects] };
      } else {
        return NextResponse.json({
          success: true,
          products: [],
          total: 0,
          page,
          pages: 0,
        });
      }
    }

    // Price range filter
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Availability filter
    const availabilityParam = searchParams.get("availability");
    if (availabilityParam === "in-stock") {
      query.stock = { $gt: 0 };
    } else if (availabilityParam === "out-of-stock") {
      query.stock = 0;
    }

    // Search filter (searches product name, description, and brand name)
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const matchingBrands = await Brand.find({
        $or: [{ name: searchRegex }, { slug: searchRegex }],
      }).select("_id");

      const searchConditions = [
        { name: searchRegex },
        { description: searchRegex },
      ];

      if (matchingBrands.length > 0) {
        const brandIdStrings = matchingBrands.map((b) => b._id.toString());
        const brandIdObjects = matchingBrands.map((b) => b._id);
        searchConditions.push({
          brand: { $in: [...brandIdStrings, ...brandIdObjects] },
        });
      }

      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Material filter
    const materialParam = searchParams.get("material");
    if (materialParam) {
      const materials = materialParam
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      if (materials.length > 0) {
        const matConditions = materials.map((m) => ({
          description: { $regex: m, $options: "i" },
        }));
        if (!query.$and) query.$and = [];
        query.$and.push({ $or: matConditions });
      }
    }

    // Strap Type filter
    const strapParam = searchParams.get("strap");
    if (strapParam) {
      const straps = strapParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (straps.length > 0) {
        const strapConditions = straps.map((s) => ({
          description: { $regex: s, $options: "i" },
        }));
        if (!query.$and) query.$and = [];
        query.$and.push({ $or: strapConditions });
      }
    }

    // Color filter
    const colorParam = searchParams.get("color");
    if (colorParam) {
      const colors = colorParam
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (colors.length > 0) {
        const colorConditions = colors.flatMap((c) => [
          { description: { $regex: c, $options: "i" } },
          { name: { $regex: c, $options: "i" } },
        ]);
        if (!query.$and) query.$and = [];
        query.$and.push({ $or: colorConditions });
      }
    }

    // Sort order — always append _id as a tiebreaker to guarantee a stable
    // cursor across pages. Without a unique secondary sort key, MongoDB may
    // return documents in different orders on each request when the primary
    // sort field (price, createdAt) has many ties, causing duplicate watch
    // cards across pages.

    const total = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    // For non-admin requests, project only the fields needed for product cards.
    // This significantly reduces the MongoDB → Next.js → browser payload.
    const projection = isAdminReq
      ? {}
      : { name: 1, brand: 1, price: 1, stock: 1, image: 1, images: 1, status: 1, order: 1,
          r2Image: 1, r2ImageStandard: 1, r2Images: 1, r2ImagesStandard: 1 };

    // ─── MODEL-GROUPED SORT ──────────────────────────────────────────────────
    // When a brand filter is active on the public storefront and sort=featured,
    // use an aggregation pipeline to extract a normalised "modelKey" from the
    // product name and sort by it.  This keeps every model family (e.g. all
    // PRX variants, all PRC 200 variants) together across pages regardless of
    // how the full names differ in length or casing.
    //
    // modelKey derivation (via MongoDB $toLower + $split + $slice + $concat):
    //   "Tissot PRX Powermatic 80" → lowercase → ["tissot","prx","powermatic","80"]
    //   → take first 3 words → "tissot prx powermatic"
    //   "Tissot PRC 200 Chronograph" → "tissot prc 200"
    //   This is enough to cluster all PRX variants before PRC variants, etc.
    //
    // Within the same modelKey, products are sorted by their full lowercase
    // name so variants appear in a consistent order (Chronograph, Powermatic,
    // Quartz …).  _id is the final tiebreaker for a stable cursor across pages.
    // ─────────────────────────────────────────────────────────────────────────

    const useModelGrouping =
      (sortParam === "order" || sortParam === "featured" || !sortParam) &&
      brandParam &&
      !isAdminReq;

    let products;

    if (useModelGrouping) {

      // $split the lowercased name into words, take first 3 tokens, join with space → modelKey
      const addFieldsStage = {
        $addFields: {
          _modelKey: {
            $reduce: {
              input: {
                $slice: [
                  { $split: [{ $toLower: "$name" }, " "] },
                  3,
                ],
              },
              initialValue: "",
              in: {
                $cond: [
                  { $eq: ["$$value", ""] },
                  "$$this",
                  { $concat: ["$$value", " ", "$$this"] },
                ],
              },
            },
          },
          _nameLower: { $toLower: "$name" },
        },
      };

      const pipeline = [
        { $match: query },
        addFieldsStage,
        {
          $sort: {
            _modelKey: 1,   // group by model family
            _nameLower: 1,  // within the family, sort by full name
            _id: 1,         // stable cursor
          },
        },
        { $skip: skip },
        { $limit: limit },
      ];

      // Remove the computed helper fields; keep all real document fields.
      // We use a pure-exclusion $project so we don't have to list every field.
      pipeline.push({ $project: { _modelKey: 0, _nameLower: 0 } });

      // Run aggregation then populate brand manually
      const rawDocs = await Product.aggregate(pipeline).collation({ locale: "en", strength: 2 });

      // Populate brand field
      const brandIds = [...new Set(rawDocs.map((d) => d.brand?.toString()).filter(Boolean))];
      const brandDocs = await Brand.find({
        _id: { $in: brandIds.map((id) => {
          try { return new mongoose.Types.ObjectId(id); } catch { return null; }
        }).filter(Boolean) },
      }).select("name slug image").lean();
      const brandMap = {};
      brandDocs.forEach((b) => { brandMap[b._id.toString()] = b; });

      products = rawDocs.map((p) => {
        const brandId = p.brand?.toString();
        const brandObj = brandMap[brandId] || null;
        return {
          ...p,
          id: p._id.toString(),
          _id: undefined,
          __v: undefined,
          order: p.order ?? 0,
          brand: brandObj?.name ?? "UNKNOWN",
          brandId: brandId ?? "",
          brandData: brandObj,
        };
      });
    } else {
      // Standard sort path (no model grouping needed)
      let sortObj;
      let useCollation = false;
      if (sortParam === "price-low" || sortParam === "price-asc") {
        sortObj = { price: 1, _id: 1 };
      } else if (sortParam === "price-high" || sortParam === "price-desc") {
        sortObj = { price: -1, _id: -1 };
      } else if (sortParam === "newest") {
        sortObj = { _id: -1 };
      } else {
        sortObj = { order: 1, _id: 1 };
      }

      let findQuery = Product.find(query, projection)
        .populate("brand", "name slug image")
        .sort(sortObj);

      if (useCollation) {
        findQuery = findQuery.collation({ locale: "en", strength: 2 });
      }

      const rawProducts = await findQuery.skip(skip).limit(limit).lean();

      products = rawProducts.map((p) => {
        const brandObj = p.brand;
        const brandName = typeof brandObj === "object" && brandObj !== null
          ? brandObj.name
          : "UNKNOWN";

        return {
          ...p,
          id: p._id.toString(),
          _id: undefined,
          __v: undefined,
          order: p.order ?? 0,
          brand: brandName,
          brandId: typeof brandObj === "object" && brandObj !== null
            ? brandObj._id?.toString()
            : String(p.brand),
          brandData: typeof brandObj === "object" ? brandObj : null,
        };
      });
    }

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify brand exists
    let brandId = parsed.data.brand;
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      // Try lookup by name
      const brandDoc = await Brand.findOne({
        name: { $regex: new RegExp(`^${brandId}$`, "i") },
      });
      if (!brandDoc) {
        return NextResponse.json(
          { success: false, error: "Selected brand does not exist" },
          { status: 400 }
        );
      }
      brandId = brandDoc._id;
    } else {
      const exists = await Brand.findById(brandId);
      if (!exists) {
        return NextResponse.json(
          { success: false, error: "Selected brand does not exist" },
          { status: 400 }
        );
      }
    }

    // Ensure main image is synced with images array
    let mainImage = parsed.data.image;
    let mainPublicId = parsed.data.imagePublicId;
    const imagesList = Array.isArray(parsed.data.images) ? [...parsed.data.images] : [];
    const publicIdsList = Array.isArray(parsed.data.imagePublicIds) ? [...parsed.data.imagePublicIds] : [];

    if (!mainImage && imagesList.length > 0) {
      mainImage = imagesList[0];
      mainPublicId = publicIdsList[0] || "";
    }
    if (mainImage && !imagesList.includes(mainImage)) {
      imagesList.unshift(mainImage);
      if (mainPublicId && !publicIdsList.includes(mainPublicId)) {
        publicIdsList.unshift(mainPublicId);
      }
    }

    let finalOrder = parsed.data.order;
    if (finalOrder === undefined || finalOrder === null) {
      // Every newly added watch takes the 1st position (order: 1).
      // Increment existing products' order by 1 so the previous #1 takes spot #2, #2 takes spot #3, etc.
      await Product.updateMany({}, { $inc: { order: 1 } });
      finalOrder = 1;
    } else {
      // If a specific position is explicitly requested, shift everything at or after that order
      await Product.updateMany({ order: { $gte: finalOrder } }, { $inc: { order: 1 } });
    }

    const product = await Product.create({
      ...parsed.data,
      brand: brandId,
      image: mainImage,
      imagePublicId: mainPublicId,
      images: imagesList,
      imagePublicIds: publicIdsList,
      order: finalOrder,
      // R2 fields (null-safe — only set if provided)
      ...(parsed.data.r2Image != null && { r2Image: parsed.data.r2Image }),
      ...(parsed.data.r2ImageStandard != null && { r2ImageStandard: parsed.data.r2ImageStandard }),
      ...(parsed.data.r2ImageFull != null && { r2ImageFull: parsed.data.r2ImageFull }),
      ...(parsed.data.r2Key != null && { r2Key: parsed.data.r2Key }),
      ...(parsed.data.r2KeyStandard != null && { r2KeyStandard: parsed.data.r2KeyStandard }),
      ...(parsed.data.r2KeyFull != null && { r2KeyFull: parsed.data.r2KeyFull }),
      ...(parsed.data.r2Images?.length && { r2Images: parsed.data.r2Images }),
      ...(parsed.data.r2ImagesStandard?.length && { r2ImagesStandard: parsed.data.r2ImagesStandard }),
      ...(parsed.data.r2ImagesFull?.length && { r2ImagesFull: parsed.data.r2ImagesFull }),
      ...(parsed.data.r2Keys?.length && { r2Keys: parsed.data.r2Keys }),
      ...(parsed.data.r2KeysStandard?.length && { r2KeysStandard: parsed.data.r2KeysStandard }),
      ...(parsed.data.r2KeysFull?.length && { r2KeysFull: parsed.data.r2KeysFull }),
    });

    const populated = await Product.findById(product._id)
      .populate("brand", "name slug image")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: {
          ...populated,
          id: populated._id.toString(),
          _id: undefined,
          __v: undefined,
          order: populated.order ?? 0,
          brand: populated.brand?.name || "UNKNOWN",
          brandId: populated.brand?._id?.toString() || String(populated.brand),
          brandData: populated.brand,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { id, order, status, items } = body;

    await connectDB();

    // Support batch reorder: { items: [{ id, order }, ...] }
    if (Array.isArray(items) && items.length > 0) {
      const validUpdates = items.filter(
        (it) => it && it.id && mongoose.Types.ObjectId.isValid(it.id)
      );

      if (validUpdates.length > 0) {
        const bulkOps = validUpdates.map((it) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(it.id) },
            update: { $set: { order: Number(it.order) } },
          },
        }));

        await Product.bulkWrite(bulkOps);
      }

      return NextResponse.json({
        success: true,
        message: "Product orders updated successfully",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(new mongoose.Types.ObjectId(id));
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (order !== undefined) {
      const parsedOrder = parseInt(order, 10);
      if (!isNaN(parsedOrder)) {
        const totalProducts = await Product.countDocuments();
        const targetOrder = Math.max(1, Math.min(totalProducts, parsedOrder));
        const currentOrder = product.order ?? 1;

        if (currentOrder !== targetOrder) {
          if (targetOrder < currentOrder) {
            // Moving up in priority (e.g. from 134 to 1)
            // Shift all products in [targetOrder, currentOrder - 1] down by +1
            await Product.updateMany(
              {
                order: { $gte: targetOrder, $lt: currentOrder },
                _id: { $ne: product._id },
              },
              { $inc: { order: 1 } }
            );
          } else {
            // Moving down in priority (e.g. from 1 to 50)
            // Shift all products in [currentOrder + 1, targetOrder] up by -1
            await Product.updateMany(
              {
                order: { $gt: currentOrder, $lte: targetOrder },
                _id: { $ne: product._id },
              },
              { $inc: { order: -1 } }
            );
          }
          product.order = targetOrder;
        }
      }
    }
    if (status !== undefined) product.status = status;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        id: product._id.toString(),
        name: product.name,
        order: product.order,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
