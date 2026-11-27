/**
 * Image optimizer using Sharp.
 * Generates 3 WebP variants from any image buffer or URL:
 *   - thumb:    max 400px wide  (product cards, thumbnails)
 *   - standard: max 800px wide  (product detail)
 *   - full:     max 1200px wide (zoom / high-res)
 *
 * SERVER SIDE ONLY. Never import in client components.
 */

const VARIANTS = [
  { name: "thumb", width: 400, quality: 82 },
  { name: "standard", width: 800, quality: 82 },
  { name: "full", width: 1200, quality: 82 },
];

/**
 * Dynamically import Sharp (avoids issues with Next.js bundling).
 */
async function getSharp() {
  const sharp = (await import("sharp")).default;
  return sharp;
}

/**
 * Process an image buffer into 3 WebP variants.
 * @param {Buffer} inputBuffer - Raw image bytes (JPEG, PNG, WebP, etc.)
 * @returns {Promise<Array<{ name: string, buffer: Buffer, width: number }>>}
 */
export async function processImageVariants(inputBuffer) {
  const sharp = await getSharp();
  const results = [];

  for (const variant of VARIANTS) {
    const buffer = await sharp(inputBuffer)
      .resize(variant.width, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: variant.quality })
      .toBuffer();

    results.push({ name: variant.name, buffer, width: variant.width });
  }

  return results;
}

/**
 * Download an image from a URL and return as a Buffer.
 * @param {string} url - Image URL to download
 * @returns {Promise<Buffer>}
 */
export async function fetchImageBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DripEssentials-ImageMigrator/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText} — ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Process a URL: download it, run Sharp, return 3 variant buffers.
 * @param {string} imageUrl - Source image URL
 * @returns {Promise<Array<{ name: string, buffer: Buffer, width: number }>>}
 */
export async function processImageFromUrl(imageUrl) {
  const inputBuffer = await fetchImageBuffer(imageUrl);
  return processImageVariants(inputBuffer);
}
