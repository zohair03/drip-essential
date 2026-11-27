/**
 * R2 Upload API Route — uploads ONE single original image to Cloudflare R2.
 * Dynamic resizing & optimization is handled on-the-fly by Cloudflare Image Transformations.
 *
 * POST /api/upload/r2
 * - Stores ONE original image in R2 at products/<cleanFilename>
 * - Sets immutable 1-year CDN caching headers
 * - Returns the original R2 image URL: https://images.dripessential.in/products/<filename>
 */
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { uploadToR2 } from "@/lib/r2";
import { thumbnailImage } from "@/lib/cloudflareImage";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is not a supported image type.`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the size limit.`,
          },
          { status: 400 }
        );
      }

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Preserve clean original filename without path traversal characters
      const cleanFilename = file.name.replace(/^.*[\\\/]/, "").trim();
      const key = `products/${cleanFilename}`;

      // Upload ONE single original image to R2 with 1-year immutable cache
      const url = await uploadToR2(key, inputBuffer, file.type || "image/png");

      results.push({
        url,
        previewUrl: thumbnailImage(url),
        key,
        publicId: cleanFilename,
      });
    }

    return NextResponse.json({ success: true, images: results });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
