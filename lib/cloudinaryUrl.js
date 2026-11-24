/**
 * Cloudinary URL transformation utility.
 *
 * Inserts transformation parameters after `/upload/` in a Cloudinary URL so
 * the CDN serves correctly-sized, auto-formatted images.
 *
 * Input:  https://res.cloudinary.com/dnqbhqi6/image/upload/v1234/path/image.jpg
 * Output: https://res.cloudinary.com/dnqbhqi6/image/upload/f_auto,q_auto,w_400/v1234/path/image.jpg
 */

const CLOUDINARY_ORIGIN = "res.cloudinary.com";

/**
 * Transforms a Cloudinary URL to include the given transformation string.
 *
 * @param {string} url        - Original Cloudinary image URL.
 * @param {string} transforms - Cloudinary transformation string, e.g. "f_auto,q_auto,w_400".
 * @returns {string}          - Transformed URL, or the original URL if not a Cloudinary URL.
 */
export function buildCloudinaryUrl(url, transforms) {
  if (!url || typeof url !== "string") return url || "";

  // Pass through non-Cloudinary URLs unchanged
  if (!url.includes(CLOUDINARY_ORIGIN)) return url;

  // Already has these exact transforms – avoid double-inserting
  if (url.includes(transforms)) return url;

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  // If the URL already has *some* transforms (after /upload/ there's no "v"
  // number and no raw filename), skip to avoid stacking.
  const afterUpload = url.slice(idx + marker.length);
  // Existing transforms look like "f_auto,..." or "w_400,..." (contain "_")
  // A version segment looks like "v1234567890/"
  const hasExistingTransforms =
    !afterUpload.match(/^v\d+\//) && afterUpload.includes("_");
  if (hasExistingTransforms) return url;

  return url.slice(0, idx + marker.length) + transforms + "/" + afterUpload;
}

/**
 * Returns a Cloudinary URL optimised for a product card thumbnail.
 * Uses f_auto (best format for browser), q_auto (quality), and a capped width.
 *
 * @param {string} url    - Original Cloudinary URL.
 * @param {number} width  - Target display width in pixels (default 400).
 */
export function cardImageUrl(url, width = 400) {
  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width}`);
}

/**
 * Returns a Cloudinary URL optimised for a full-size hero / product detail image.
 *
 * @param {string} url    - Original Cloudinary URL.
 * @param {number} width  - Target display width in pixels (default 900).
 */
export function heroImageUrl(url, width = 900) {
  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width}`);
}

/**
 * Returns a Cloudinary URL optimised for a small thumbnail (gallery strip, brand logo, etc.).
 *
 * @param {string} url    - Original Cloudinary URL.
 * @param {number} width  - Target display width in pixels (default 200).
 */
export function thumbImageUrl(url, width = 200) {
  return buildCloudinaryUrl(url, `f_auto,q_auto,w_${width}`);
}
