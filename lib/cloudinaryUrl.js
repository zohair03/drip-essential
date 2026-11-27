/**
 * Cloudinary URL transformation utility.
 *
 * Inserts transformation parameters into Cloudinary URLs so
 * the Cloudinary Fastly/Akamai CDN edge serves correctly-sized,
 * WebP/AVIF auto-formatted images directly to browsers without
 * consuming Vercel Image Optimization quotas or downloading raw origin images.
 *
 * Input:  https://res.cloudinary.com/dnqbhqi6/image/upload/v1794827765/0.3758946925714258.jpg
 * Output: https://res.cloudinary.com/dnqbhqi6/image/upload/f_auto,q_auto,w_400,c_limit/v1794827765/0.3758946925714258.jpg
 */

import {
  getCloudflareImageUrl,
  thumbnailImage,
  standardImage,
  fullImage,
  isCloudflareR2Url,
} from "./cloudflareImage";

export {
  getCloudflareImageUrl,
  thumbnailImage,
  standardImage,
  fullImage,
  isCloudflareR2Url,
};

const CLOUDINARY_ORIGIN = "res.cloudinary.com";

/**
 * Transforms a Cloudinary URL to include the given transformation string.
 * If the URL already has transformations, replaces them cleanly.
 * Non-Cloudinary URLs or empty strings pass through unchanged.
 *
 * @param {string} url        - Original Cloudinary image URL.
 * @param {string} transforms - Transformation string, e.g. "f_auto,q_auto,w_400,c_limit".
 * @returns {string}          - Transformed URL.
 */
export function buildCloudinaryUrl(url, transforms) {
  if (!url || typeof url !== "string") return url || "";
  
  // If it's an R2 URL, return it (handled by Cloudflare Image Transformations)
  if (!url.includes(CLOUDINARY_ORIGIN)) return url;

  const uploadMarker = "/upload/";
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + uploadMarker.length);
  const remainder = url.slice(idx + uploadMarker.length);

  // Check if remainder starts with an existing transformation segment
  const parts = remainder.split("/");
  if (
    parts.length > 1 &&
    (parts[0].includes(",") || /^[a-z]{1,3}_/.test(parts[0]))
  ) {
    // Replace existing transformation segment cleanly
    return prefix + transforms + "/" + parts.slice(1).join("/");
  }

  // Insert transformations before the remainder (version and/or publicId)
  return prefix + transforms + "/" + remainder;
}

/**
 * Returns a Cloudflare or Cloudinary URL for a product card thumbnail (collection grid, bestsellers, showcase).
 * - Cloudflare R2: dynamically transformed via /cdn-cgi/image/width=400,quality=75,format=auto
 * - Cloudinary: dynamically transformed via f_auto,q_auto,w_{width},c_limit
 *
 * @param {string} url    - Original Cloudinary or R2 URL.
 * @param {number} width  - Target display width in pixels (default 400).
 */
export function cardImageUrl(url, width = 400) {
  if (!url || typeof url !== "string") return url || "";

  if (isCloudflareR2Url(url)) {
    return width > 600 ? standardImage(url) : thumbnailImage(url);
  }

  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width},c_limit`);
}

/**
 * Returns a Cloudflare or Cloudinary URL for a full-size product detail hero image.
 * - Cloudflare R2: width=800,quality=80,format=auto or width=1200,quality=85,format=auto
 * - Cloudinary: f_auto,q_auto,w_{width},c_limit
 *
 * @param {string} url    - Original Cloudinary or R2 URL.
 * @param {number} width  - Target display width in pixels (default 900).
 */
export function heroImageUrl(url, width = 900) {
  if (!url || typeof url !== "string") return url || "";

  if (isCloudflareR2Url(url)) {
    return width >= 800 ? fullImage(url) : standardImage(url);
  }

  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width},c_limit`);
}

/**
 * Returns a Cloudflare or Cloudinary URL for small thumbnails (admin lists, search suggestions, brand logos).
 * - Cloudflare R2: width=400,quality=75,format=auto
 * - Cloudinary: f_auto,q_auto,w_{width},c_limit
 *
 * @param {string} url    - Original Cloudinary or R2 URL.
 * @param {number} width  - Target display width in pixels (default 160).
 */
export function thumbImageUrl(url, width = 160) {
  if (!url || typeof url !== "string") return url || "";

  if (isCloudflareR2Url(url)) {
    return thumbnailImage(url);
  }

  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width},c_limit`);
}
