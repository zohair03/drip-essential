import { v2 as cloudinary } from "cloudinary";

// Configure the Cloudinary SDK — server-side only
cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generate a signed upload signature for browser-to-Cloudinary direct uploads.
 * Never exposes CLOUDINARY_API_SECRET to the client.
 */
export function generateUploadSignature(folder = "drip-essential/products") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

/**
 * Delete a single image from Cloudinary by its public ID.
 */
export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return { result: "skipped" };
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return { result: "error", error: error.message };
  }
}

/**
 * Delete multiple images from Cloudinary.
 */
export async function deleteCloudinaryImages(publicIds = []) {
  const results = [];
  for (const id of publicIds) {
    if (id && id.trim()) {
      const r = await deleteCloudinaryImage(id.trim());
      results.push({ publicId: id, result: r });
    }
  }
  return results;
}

/**
 * Build an optimized Cloudinary image URL from a public ID or existing URL.
 * Safe for both server and client use.
 */
export function getCloudinaryUrl(publicIdOrUrl, options = {}) {
  if (!publicIdOrUrl) return "";
  if (
    publicIdOrUrl.startsWith("http://") ||
    publicIdOrUrl.startsWith("https://")
  ) {
    return publicIdOrUrl;
  }

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnqbhqi6";
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "scale",
  } = options;

  const transformations = [`f_${format}`, `q_${quality}`];
  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  const cleanPublicId = publicIdOrUrl.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(",")}/${cleanPublicId}`;
}

export { cloudinary };
