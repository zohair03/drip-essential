import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Brand from "@/lib/models/Brand";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required").trim().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number").optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  status: z.enum(["Active", "Draft"]).optional(),
  order: z.coerce.number().int().optional(),
});

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 404 }
      );
    }

    await connectDB();
    const product = await Product.findById(id)
      .populate("brand", "name slug image")
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // If draft, only admin can view
    if (product.status === "Draft") {
      const admin = await getAuthenticatedAdmin(request);
      if (!admin) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: product._id.toString(),
        _id: undefined,
        __v: undefined,
        order: product.order ?? 0,
        brand: product.brand?.name || "UNKNOWN",
        brandId: product.brand?._id?.toString() || String(product.brand),
        brandData: product.brand,
      },
    });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
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
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updateData = { ...parsed.data };

    // If brand is provided, validate it
    if (updateData.brand) {
      let brandId = updateData.brand;
      if (!mongoose.Types.ObjectId.isValid(brandId)) {
        const brandDoc = await Brand.findOne({
          name: { $regex: new RegExp(`^${brandId}$`, "i") },
        });
        if (!brandDoc) {
          return NextResponse.json(
            { success: false, error: "Selected brand does not exist" },
            { status: 400 }
          );
        }
        updateData.brand = brandDoc._id;
      } else {
        const exists = await Brand.findById(brandId);
        if (!exists) {
          return NextResponse.json(
            { success: false, error: "Selected brand does not exist" },
            { status: 400 }
          );
        }
      }
    }

    // Find any removed images that need to be deleted from Cloudinary
    if (Array.isArray(updateData.imagePublicIds)) {
      const currentIds = existing.imagePublicIds || [];
      const newIds = updateData.imagePublicIds;
      const removedIds = currentIds.filter((cid) => !newIds.includes(cid));

      if (removedIds.length > 0) {
        // Also check if any other product uses this image before deleting
        const otherUses = await Product.find({
          _id: { $ne: id },
          $or: [
            { imagePublicId: { $in: removedIds } },
            { imagePublicIds: { $in: removedIds } },
          ],
        }).select("imagePublicId imagePublicIds");

        const usedElsewhere = new Set();
        otherUses.forEach((op) => {
          if (op.imagePublicId) usedElsewhere.add(op.imagePublicId);
          (op.imagePublicIds || []).forEach((pid) => usedElsewhere.add(pid));
        });

        const safeToDelete = removedIds.filter((pid) => !usedElsewhere.has(pid));
        if (safeToDelete.length > 0) {
          await deleteCloudinaryImages(safeToDelete);
        }
      }
    }

    // Ensure main image consistency
    if (updateData.images && updateData.images.length > 0 && !updateData.image) {
      updateData.image = updateData.images[0];
      if (updateData.imagePublicIds && updateData.imagePublicIds.length > 0) {
        updateData.imagePublicId = updateData.imagePublicIds[0];
      }
    }

    Object.assign(existing, updateData);
    await existing.save();

    const populated = await Product.findById(id)
      .populate("brand", "name slug image")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
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
    });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
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
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Gather all public IDs from this product
    const allPublicIds = new Set(product.imagePublicIds || []);
    if (product.imagePublicId) allPublicIds.add(product.imagePublicId);
    const idArray = Array.from(allPublicIds).filter(Boolean);

    // Delete product from database
    await Product.findByIdAndDelete(id);

    // Check if images are referenced by other products before deleting from Cloudinary
    if (idArray.length > 0) {
      const otherUses = await Product.find({
        $or: [
          { imagePublicId: { $in: idArray } },
          { imagePublicIds: { $in: idArray } },
        ],
      }).select("imagePublicId imagePublicIds");

      const usedElsewhere = new Set();
      otherUses.forEach((op) => {
        if (op.imagePublicId) usedElsewhere.add(op.imagePublicId);
        (op.imagePublicIds || []).forEach((pid) => usedElsewhere.add(pid));
      });

      const safeToDelete = idArray.filter((pid) => !usedElsewhere.has(pid));
      if (safeToDelete.length > 0) {
        await deleteCloudinaryImages(safeToDelete);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
