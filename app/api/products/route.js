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
    let sortObj;
    if (sortParam === "price-low" || sortParam === "price-asc") {
      sortObj = { price: 1, _id: 1 };
    } else if (sortParam === "price-high" || sortParam === "price-desc") {
      sortObj = { price: -1, _id: -1 };
    } else if (sortParam === "newest") {
      sortObj = { _id: -1 };
    } else if (sortParam === "order" || sortParam === "featured" || !sortParam) {
      sortObj = { order: 1, _id: 1 };
    } else {
      sortObj = { order: 1, _id: 1 };
    }

    const total = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("brand", "name slug image")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const serialized = products.map((p) => {
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

    return NextResponse.json({
      success: true,
      products: serialized,
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
      const highest = await Product.findOne({}).sort({ order: -1 }).select("order");
      finalOrder = (highest?.order || 0) + 1;
    }

    const product = await Product.create({
      ...parsed.data,
      brand: brandId,
      image: mainImage,
      imagePublicId: mainPublicId,
      images: imagesList,
      imagePublicIds: publicIdsList,
      order: finalOrder,
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

    if (order !== undefined) product.order = Number(order);
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
