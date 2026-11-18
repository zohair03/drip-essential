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
});

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const admin = await getAuthenticatedAdmin(request);
    const query = includeInactive && admin ? {} : { status: "Active" };

    const brands = await Brand.find(query).sort({ name: 1 }).lean();

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
      productCount: countMap[b._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      brands: serialized,
    });
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

    const brand = await Brand.create({
      ...parsed.data,
      slug,
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
