import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Brand, { generateSlug } from "@/lib/models/Brand";
import Product from "@/lib/models/Product";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

const brandUpdateSchema = z.object({
  name: z.string().min(1, "Brand name is required").trim().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid brand ID" },
        { status: 404 }
      );
    }

    await connectDB();
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    const productCount = await Product.countDocuments({ brand: brand._id });

    return NextResponse.json({
      success: true,
      brand: {
        ...brand,
        id: brand._id.toString(),
        _id: undefined,
        productCount,
      },
    });
  } catch (error) {
    console.error("Brand GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid brand ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = brandUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Brand.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // If changing name, check if duplicate exists and update slug
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const newSlug = generateSlug(parsed.data.name);
      const duplicate = await Brand.findOne({
        _id: { $ne: id },
        $or: [
          { name: { $regex: new RegExp(`^${parsed.data.name}$`, "i") } },
          { slug: newSlug },
        ],
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "A brand with this name already exists" },
          { status: 400 }
        );
      }
      existing.slug = newSlug;
    }

    // If replacing brand image, delete old one from Cloudinary
    if (
      parsed.data.imagePublicId &&
      existing.imagePublicId &&
      parsed.data.imagePublicId !== existing.imagePublicId
    ) {
      await deleteCloudinaryImage(existing.imagePublicId);
    }

    Object.assign(existing, parsed.data);
    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      brand: {
        id: existing._id.toString(),
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
        image: existing.image,
        imagePublicId: existing.imagePublicId,
        status: existing.status,
      },
    });
  } catch (error) {
    console.error("Brand update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid brand ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Prevent deletion if products reference this brand
    const productCount = await Product.countDocuments({ brand: id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete brand: ${productCount} product(s) are currently associated with it. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if set
    if (brand.imagePublicId) {
      await deleteCloudinaryImage(brand.imagePublicId);
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Brand delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
