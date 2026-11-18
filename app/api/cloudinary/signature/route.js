import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let folder = "drip-essential/products";
    try {
      const body = await request.json();
      if (body?.folder && typeof body.folder === "string") {
        // Sanitize folder
        folder = body.folder.replace(/[^a-zA-Z0-9_\-\/]/g, "");
      }
    } catch {
      // Body is optional
    }

    const signatureData = generateUploadSignature(folder);

    return NextResponse.json({
      success: true,
      ...signatureData,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
