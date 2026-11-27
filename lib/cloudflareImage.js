/**
 * Centralized Cloudflare Image Transformation Utility for Drip Essentials
 *
 * Transforms original R2 image URLs via Cloudflare's /cdn-cgi/image/ interface:
 * https://images.dripessential.in/cdn-cgi/image/<options>/products/<filename>
 *
 * Cloudflare dynamically resizes, auto-converts to AVIF/WebP, and caches at the edge.
 */

export const R2_IMAGE_DOMAIN = "images.dripessential.in";

export const CLOUDFLARE_IMAGE_PRESETS = {
  thumbnail: {
    width: 400,
    quality: 75,
    format: "auto",
  },
  standard: {
    width: 800,
    quality: 80,
    format: "auto",
  },
  full: {
    width: 1200,
    quality: 85,
    format: "auto",
  },
};

/**
 * Checks if a URL is hosted on the approved R2 custom image domain.
 * @param {string} url
 * @returns {boolean}
 */
export function isCloudflareR2Url(url) {
  if (!url || typeof url !== "string") return false;
  return url.includes(R2_IMAGE_DOMAIN);
}

/**
 * Strips any existing /cdn-cgi/image/... transformation segment from an R2 URL
 * to return the clean original object path.
 *
 * @param {string} url
 * @returns {string} - Clean original URL, e.g. "https://images.dripessential.in/products/watch.png"
 */
export function stripCloudflareTransformation(url) {
  if (!url || typeof url !== "string") return url || "";
  const marker = "/cdn-cgi/image/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx); // "https://images.dripessential.in"
  const afterMarker = url.slice(idx + marker.length); // "width=400,quality=75,format=auto/products/watch.png"
  const slashIdx = afterMarker.indexOf("/");

  if (slashIdx === -1) return url;
  const originalPath = afterMarker.slice(slashIdx); // "/products/watch.png"

  return `${prefix}${originalPath}`;
}

/**
 * Builds a Cloudflare Image Transformation URL from an original R2 image URL.
 *
 * @param {string} url - Original image URL
 * @param {"thumbnail" | "standard" | "full" | object} presetOrOptions - Preset name or custom options
 * @returns {string} - Transformed URL or original URL if not transformable
 */
export function getCloudflareImageUrl(url, presetOrOptions = "standard") {
  if (!url || typeof url !== "string") return url || "";

  // Only transform images hosted on our approved R2 domain
  if (!isCloudflareR2Url(url)) {
    return url;
  }

  // Determine transformation options
  let opts;
  if (typeof presetOrOptions === "string") {
    opts = CLOUDFLARE_IMAGE_PRESETS[presetOrOptions] || CLOUDFLARE_IMAGE_PRESETS.standard;
  } else if (typeof presetOrOptions === "object" && presetOrOptions !== null) {
    opts = {
      width: presetOrOptions.width || 800,
      quality: presetOrOptions.quality || 80,
      format: presetOrOptions.format || "auto",
    };
  } else {
    opts = CLOUDFLARE_IMAGE_PRESETS.standard;
  }

  // Format options: width=800,quality=80,format=auto
  const params = [];
  if (opts.width) params.push(`width=${opts.width}`);
  if (opts.quality) params.push(`quality=${opts.quality}`);
  if (opts.format) params.push(`format=${opts.format}`);
  const paramString = params.join(",");

  // Clean URL of any previous /cdn-cgi/image/ segment
  const cleanUrl = stripCloudflareTransformation(url);

  // Extract path after domain: https://images.dripessential.in/products/watch.png -> /products/watch.png
  try {
    const parsed = new URL(cleanUrl);
    const origin = parsed.origin;
    const pathnameAndQuery = parsed.pathname + parsed.search;

    // Do not double-slash: /cdn-cgi/image/<params>/<path-without-leading-slash>
    const cleanPath = pathnameAndQuery.startsWith("/")
      ? pathnameAndQuery.slice(1)
      : pathnameAndQuery;

    return `${origin}/cdn-cgi/image/${paramString}/${cleanPath}`;
  } catch {
    // Fallback regex if URL parsing fails
    const match = cleanUrl.match(/^(https?:\/\/[^\/]+)\/(.+)$/);
    if (match) {
      return `${match[1]}/cdn-cgi/image/${paramString}/${match[2]}`;
    }
    return cleanUrl;
  }
}

/**
 * Thumbnail preset: width=400, quality=75, format=auto
 * Ideal for: Product cards, catalog grid, best sellers, search suggestions, admin lists
 */
export function thumbnailImage(url) {
  return getCloudflareImageUrl(url, "thumbnail");
}

/**
 * Standard preset: width=800, quality=80, format=auto
 * Ideal for: Product detail hero, medium viewports, tablet cards
 */
export function standardImage(url) {
  return getCloudflareImageUrl(url, "standard");
}

/**
 * Full preset: width=1200, quality=85, format=auto
 * Ideal for: High-DPI screens, desktop product detail hero, image zoom inspection
 */
export function fullImage(url) {
  return getCloudflareImageUrl(url, "full");
}
