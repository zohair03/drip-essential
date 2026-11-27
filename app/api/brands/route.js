import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Brand, { generateSlug } from "@/lib/models/Brand";
import Product from "@/lib/models/Product";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

const brandCreateSchema = z.object({
  name: z.string().min(1, "Brand name is required").trim(),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  imagePublicId: z.string().optional().default(""),
  status: z.enum(["Active", "Inactive"]).optional().default("Active"),
  order: z.coerce.number().int().optional(),
});

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const admin = await getAuthenticatedAdmin(request);
    const isAdminReq = !!(admin || includeInactive || searchParams.get("admin") === "true");
    const query = includeInactive && isAdminReq ? {} : { status: "Active" };

    const brands = await Brand.find(query)
      .sort({ order: 1, name: 1, _id: 1 })
      .lean();

    // Attach product count to each brand
    const brandIds = brands.map((b) => b._id);
    const counts = await Product.aggregate([
      { $match: { brand: { $in: brandIds } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const serialized = brands.map((b) => ({
      ...b,
      id: b._id.toString(),
      _id: undefined,
      order: b.order ?? 0,
      productCount: countMap[b._id.toString()] || 0,
    }));

    const cacheHeader = isAdminReq
      ? "no-store, no-cache, must-revalidate, max-age=0"
      : "public, s-maxage=600, stale-while-revalidate=1200";

    return NextResponse.json(
      {
        success: true,
        brands: serialized,
      },
      {
        headers: {
          "Cache-Control": cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error("Brands GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
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
    const parsed = brandCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = generateSlug(parsed.data.name);

    // Check if brand with same name or slug already exists
    const existing = await Brand.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${parsed.data.name}$`, "i") } },
        { slug },
      ],
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A brand with this name already exists" },
        { status: 400 }
      );
    }

    let finalOrder = parsed.data.order;
    if (finalOrder === undefined || finalOrder === null) {
      const highest = await Brand.findOne({}).sort({ order: -1 }).select("order");
      finalOrder = (highest?.order || 0) + 1;
    }

    const brand = await Brand.create({
      ...parsed.data,
      slug,
      order: finalOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brand created successfully",
        brand: {
          id: brand._id.toString(),
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          image: brand.image,
          imagePublicId: brand.imagePublicId,
          status: brand.status,
          order: brand.order,
          productCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Brand create error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create brand" },
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

        await Brand.bulkWrite(bulkOps);
      }

      return NextResponse.json({
        success: true,
        message: "Brand orders updated successfully",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid brand ID" },
        { status: 400 }
      );
    }

    const brand = await Brand.findById(new mongoose.Types.ObjectId(id));
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    if (order !== undefined) brand.order = Number(order);
    if (status !== undefined) brand.status = status;

    await brand.save();

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      brand: {
        id: brand._id.toString(),
        name: brand.name,
        order: brand.order,
        status: brand.status,
      },
    });
  } catch (error) {
    console.error("Brand PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}
