import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import WhatsAppClick from "@/lib/models/WhatsAppClick";
import Product from "@/lib/models/Product";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { productId, monthYear } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: "Valid productId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify product exists
    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const currentMonthYear =
      monthYear ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await WhatsAppClick.findOneAndUpdate(
      { productId, monthYear: currentMonthYear },
      { $inc: { clickCount: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: "Click recorded" });
  } catch (error) {
    console.error("WhatsApp click tracking error:", error);
    // Return success: false but with 200 so WhatsApp redirect isn't blocked on client
    return NextResponse.json(
      { success: false, error: "Could not record click" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // 1. Total Clicks all-time
    const totalClicksAgg = await WhatsAppClick.aggregate([
      { $group: { _id: null, total: { $sum: "$clickCount" } } },
    ]);
    const totalClicks = totalClicksAgg[0]?.total || 0;

    // 2. This month clicks
    const thisMonthAgg = await WhatsAppClick.aggregate([
      { $match: { monthYear: currentMonth } },
      { $group: { _id: null, total: { $sum: "$clickCount" } } },
    ]);
    const thisMonthClicks = thisMonthAgg[0]?.total || 0;

    // 3. Product breakdown (with product details)
    const productBreakdown = await WhatsAppClick.aggregate([
      {
        $group: {
          _id: "$productId",
          totalClicks: { $sum: "$clickCount" },
          monthlyRecords: {
            $push: { month: "$monthYear", count: "$clickCount" },
          },
        },
      },
      { $sort: { totalClicks: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands",
          localField: "product.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          totalClicks: 1,
          monthlyRecords: 1,
          productName: "$product.name",
          productImage: "$product.image",
          price: "$product.price",
          brandName: "$brand.name",
        },
      },
    ]);

    // 4. Monthly trend
    const monthlyTrend = await WhatsAppClick.aggregate([
      {
        $group: {
          _id: "$monthYear",
          totalClicks: { $sum: "$clickCount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        totalClicks,
        thisMonthClicks,
        currentMonth,
        topProduct: productBreakdown[0] || null,
        productBreakdown: productBreakdown.map((p) => ({
          ...p,
          id: p.productId?.toString(),
          thisMonthCount:
            p.monthlyRecords?.find((m) => m.month === currentMonth)?.count || 0,
        })),
        monthlyTrend: monthlyTrend.map((m) => ({
          month: m._id,
          clicks: m.totalClicks,
        })),
      },
    });
  } catch (error) {
    console.error("WhatsApp analytics GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
