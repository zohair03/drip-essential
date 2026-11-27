/**
 * Cloudflare R2 client — SERVER SIDE ONLY
 * Uses AWS S3-compatible API. Never import this in client components.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID) throw new Error("R2_ACCOUNT_ID is not set");
if (!process.env.R2_ACCESS_KEY_ID) throw new Error("R2_ACCESS_KEY_ID is not set");
if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error("R2_SECRET_ACCESS_KEY is not set");
if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not set");

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

/**
 * Get the R2 public base URL (trailing slash normalized).
 */
export function getR2PublicUrl() {
  const url = process.env.R2_PUBLIC_URL || "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Build a full public URL for an R2 object key.
 * @param {string} key - e.g. "products/rolex/abc123-400.webp"
 * @returns {string} - e.g. "https://images.dripessential.in/products/rolex/abc123-400.webp"
 */
export function r2KeyToUrl(key) {
  if (!key) return "";
  return `${getR2PublicUrl()}/${key}`;
}

/**
 * Upload a Buffer to R2.
 * @param {string} key - Object key (path in bucket)
 * @param {Buffer} buffer - File content
 * @param {string} contentType - MIME type (default: "image/webp")
 * @param {number} cacheTtl - Cache-Control max-age in seconds (default: 1 year)
 * @returns {Promise<string>} - Public URL of uploaded object
 */
export async function uploadToR2(key, buffer, contentType = "image/webp", cacheTtl = 31536000) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: `public, max-age=${cacheTtl}, immutable`,
    })
  );
  return r2KeyToUrl(key);
}

/**
 * Delete a single object from R2.
 * @param {string} key - Object key
 */
export async function deleteFromR2(key) {
  if (!key) return;
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error("R2 delete error:", key, err.message);
  }
}

/**
 * Delete multiple objects from R2 in a single request.
 * @param {string[]} keys - Array of object keys
 */
export async function deleteMultipleFromR2(keys = []) {
  const valid = keys.filter(Boolean);
  if (valid.length === 0) return;

  // R2 supports batch delete up to 1000 objects
  const chunks = [];
  for (let i = 0; i < valid.length; i += 1000) {
    chunks.push(valid.slice(i, i + 1000));
  }

  for (const chunk of chunks) {
    try {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: {
            Objects: chunk.map((k) => ({ Key: k })),
            Quiet: true,
          },
        })
      );
    } catch (err) {
      console.error("R2 batch delete error:", err.message);
    }
  }
}

export { r2Client, BUCKET };
