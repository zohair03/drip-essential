import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import FeaturedItem from "@/lib/models/FeaturedItem";
import Product from "@/lib/models/Product";
import "@/lib/models/Brand"; // ensure Brand model is registered for populate
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const admin = await getAuthenticatedAdmin(request);
    const isAdminReq = !!(admin || includeInactive || searchParams.get("admin") === "true");
    const filter = { type: "bestseller" };

    if (!isAdminReq) {
      filter.status = "Active";
    }

    const items = await FeaturedItem.find(filter)
      .populate({
        path: "product",
        populate: { path: "brand", select: "name slug" },
      })
      .sort({ order: 1, createdAt: -1, _id: 1 })
      .lean();

    // Filter out items whose product was deleted or is Draft for public users
    const validItems = items.filter((item) => {
      if (!item.product) return false;
      if (!isAdminReq && item.product.status === "Draft") return false;
      return true;
    });

    const serialized = validItems.map((item) => {
      const p = item.product;
      const brandName =
        typeof p.brand === "object" && p.brand !== null
          ? p.brand.name || "UNKNOWN"
          : "UNKNOWN";

      const rawPrice = p.price ? String(p.price).replace(/,/g, "") : "0";
      const formattedPrice = !isNaN(Number(rawPrice))
        ? new Intl.NumberFormat("en-IN").format(Number(rawPrice))
        : String(p.price || "0");

      return {
        id: item._id.toString(),
        featuredItemId: item._id.toString(),
        order: item.order ?? 0,
        status: item.status,
        product: {
          id: p._id.toString(),
          name: p.name,
          brand: brandName.toUpperCase(),
          brandId: p.brand?._id?.toString() || "",
          price: formattedPrice,
          rawPrice: Number(rawPrice) || 0,
          stock: p.stock ?? 0,
          image: p.image || "/images/image.png",
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/images/image.png"],
          description: p.description || "",
          status: p.status,
        },
      };
    });

    const cacheHeader = isAdminReq
      ? "no-store, no-cache, must-revalidate, max-age=0"
      : "public, s-maxage=300, stale-while-revalidate=600";

    return NextResponse.json(
      {
        success: true,
        items: serialized,
        count: serialized.length,
      },
      {
        headers: {
          "Cache-Control": cacheHeader,
        },
      }
    );
  } catch (error) {
    console.error("Bestsellers GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bestsellers" },
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

    const body = await request.json().catch(() => ({}));
    const { productId, order = 0, status = "Active" } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: "A valid productId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in bestsellers
    const existing = await FeaturedItem.findOne({
      type: "bestseller",
      product: productId,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This watch is already in the best-sellers section" },
        { status: 400 }
      );
    }

    // Determine order if not explicitly set
    let finalOrder = Number(order) || 0;
    if (finalOrder === 0) {
      const highestOrder = await FeaturedItem.findOne({ type: "bestseller" })
        .sort({ order: -1 })
        .select("order");
      finalOrder = (highestOrder?.order || 0) + 1;
    }

    const newItem = await FeaturedItem.create({
      type: "bestseller",
      product: productId,
      order: finalOrder,
      status: status === "Inactive" ? "Inactive" : "Active",
    });

    const populated = await FeaturedItem.findById(newItem._id)
      .populate({
        path: "product",
        populate: { path: "brand", select: "name slug" },
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Watch added to best sellers successfully",
        item: {
          id: populated._id.toString(),
          order: populated.order,
          status: populated.status,
          product: populated.product,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bestsellers POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add watch to best sellers" },
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
            filter: { _id: new mongoose.Types.ObjectId(it.id), type: "bestseller" },
            update: { $set: { order: Number(it.order) } },
          },
        }));

        await FeaturedItem.bulkWrite(bulkOps);
      }

      return NextResponse.json({
        success: true,
        message: "Order updated successfully",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const item = await FeaturedItem.findOne({ _id: id, type: "bestseller" });
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Bestseller item not found" },
        { status: 404 }
      );
    }

    if (order !== undefined) item.order = Number(order);
    if (status !== undefined) item.status = status;

    await item.save();

    return NextResponse.json({
      success: true,
      message: "Bestseller item updated successfully",
      item: {
        id: item._id.toString(),
        order: item.order,
        status: item.status,
      },
    });
  } catch (error) {
    console.error("Bestsellers PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bestseller item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    const productId = searchParams.get("productId");

    await connectDB();

    let query = { type: "bestseller" };
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.product = productId;
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.id && mongoose.Types.ObjectId.isValid(body.id)) {
        query._id = body.id;
      } else if (body.productId && mongoose.Types.ObjectId.isValid(body.productId)) {
        query.product = body.productId;
      } else {
        return NextResponse.json(
          { success: false, error: "Valid id or productId is required" },
          { status: 400 }
        );
      }
    }

    const result = await FeaturedItem.findOneAndDelete(query);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Item not found in bestsellers" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Watch removed from best sellers successfully",
    });
  } catch (error) {
    console.error("Bestsellers DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove watch from best sellers" },
      { status: 500 }
    );
  }
}
