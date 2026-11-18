import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Brand from "@/lib/models/Brand";
import WhatsAppClick from "@/lib/models/WhatsAppClick";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

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

    const [
      totalProducts,
      activeProducts,
      draftProducts,
      totalBrands,
      outOfStock,
      clickData,
      recentProducts,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "Active" }),
      Product.countDocuments({ status: "Draft" }),
      Brand.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      WhatsAppClick.aggregate([
        { $group: { _id: null, total: { $sum: "$clickCount" } } },
      ]),
      Product.find()
        .populate("brand", "name slug")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Product.find({ stock: { $gt: 0, $lte: 5 } })
        .populate("brand", "name slug")
        .sort({ stock: 1 })
        .limit(5)
        .lean(),
    ]);

    const totalClicks = clickData[0]?.total || 0;

    // Top clicked products
    const topClickedAgg = await WhatsAppClick.aggregate([
      { $group: { _id: "$productId", totalClicks: { $sum: "$clickCount" } } },
      { $sort: { totalClicks: -1 } },
      { $limit: 5 },
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
          id: "$_id",
          totalClicks: 1,
          name: "$product.name",
          image: "$product.image",
          price: "$product.price",
          brand: "$brand.name",
        },
      },
    ]);

    const serializeProduct = (p) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined,
      brand: p.brand?.name || "UNKNOWN",
      brandId: p.brand?._id?.toString() || "",
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        draftProducts,
        totalBrands,
        outOfStock,
        totalClicks,
        recentProducts: recentProducts.map(serializeProduct),
        lowStockProducts: lowStockProducts.map(serializeProduct),
        mostClicked: topClickedAgg.filter((p) => p.name),
      },
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
