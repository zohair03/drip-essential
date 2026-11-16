/**
 * Cloudinary Helper Functions
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnqbhqi6",
  apiKey: process.env.CLOUDINARY_API_KEY || "924146937283738",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "B0vPgtdLWwpPrV3wg5JEvFsFaes",
};

/**
 * Builds an optimized Cloudinary image delivery URL.
 * Automatically handles format (WebP/AVIF), quality, and resizing.
 */
export function getCloudinaryUrl(publicIdOrUrl, options = {}) {
  if (!publicIdOrUrl) return "";
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    return publicIdOrUrl;
  }

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

  const transformString = transformations.join(",");
  const cleanPublicId = publicIdOrUrl.replace(/^\/+/, "");

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformString}/${cleanPublicId}`;
}

/**
 * Server-side function to fetch all uploaded images from Cloudinary.
 * Uses Cloudinary Admin API with 60s cache revalidation.
 */
export async function getCloudinaryImages(maxResults = 100) {
  const { cloudName, apiKey, apiSecret } = CLOUDINARY_CONFIG;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary credentials in environment or config.");
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=${maxResults}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Cloudinary API error: ${res.status} - ${errorMsg}`);
  }

  const data = await res.json();
  return data.resources || [];
}
