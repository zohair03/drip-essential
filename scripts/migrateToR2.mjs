/**
 * Cloudflare R2 Image Migration Script
 * 
 * Migrates existing Cloudinary product images to Cloudflare R2.
 * - Downloads each Cloudinary image
 * - Processes through Sharp (3 WebP variants: 400/800/1200px)
 * - Uploads to R2
 * - Updates MongoDB product document with R2 URLs
 * - Idempotent: skips already-migrated products (unless --force)
 * - Resumable: use --start-from <productId>
 * 
 * Usage:
 *   node scripts/migrateToR2.mjs                   # dry-run first (no DB writes)
 *   node scripts/migrateToR2.mjs --execute         # actual migration
 *   node scripts/migrateToR2.mjs --execute --force # re-migrate even if already done
 *   node scripts/migrateToR2.mjs --execute --start-from <productId>
 * 
 * Requirements:
 *   - .env.local must have all R2_* and MONGODB_URI variables set
 *   - npm install @aws-sdk/client-s3 sharp p-limit must be done
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import pLimit from "p-limit";
import sharp from "sharp";

// ── Native .env.local loader (no dotenv dependency needed) ──
const envLocalPath = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// ── CLI args ──
const args = process.argv.slice(2);
const EXECUTE = args.includes("--execute");
const FORCE = args.includes("--force");
const startFromIdx = args.indexOf("--start-from");
const START_FROM = startFromIdx !== -1 ? args[startFromIdx + 1] : null;
const CONCURRENCY = 3; // simultaneous products (be gentle on Cloudinary)

// ── R2 Config ──
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

// ── Mongoose Product Model (inline, no module resolution issues) ──
const ProductSchema = new mongoose.Schema({
  name: String,
  brand: mongoose.Schema.Types.Mixed,
  image: String,
  imagePublicId: String,
  images: [String],
  imagePublicIds: [String],
  status: String,
  order: Number,
  r2Image: { type: String, default: null },
  r2ImageStandard: { type: String, default: null },
  r2ImageFull: { type: String, default: null },
  r2Key: { type: String, default: null },
  r2KeyStandard: { type: String, default: null },
  r2KeyFull: { type: String, default: null },
  r2Images: [String],
  r2ImagesStandard: [String],
  r2ImagesFull: [String],
  r2Keys: [String],
  r2KeysStandard: [String],
  r2KeysFull: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// ── Helpers ──

function r2KeyToUrl(key) {
  return `${R2_PUBLIC_URL}/${key}`;
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DripEssentials-Migrator/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processVariants(inputBuffer) {
  const VARIANTS = [
    { name: "thumb", width: 400, quality: 82 },
    { name: "standard", width: 800, quality: 82 },
    { name: "full", width: 1200, quality: 82 },
  ];
  const results = [];
  for (const v of VARIANTS) {
    const buffer = await sharp(inputBuffer)
      .resize(v.width, null, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: v.quality })
      .toBuffer();
    results.push({ name: v.name, buffer });
  }
  return results;
}

async function uploadVariant(key, buffer) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return r2KeyToUrl(key);
}

function extractBaseName(imageUrl, fallbackId, suffix) {
  try {
    const filename = imageUrl.split("/").pop().split("?")[0];
    const stem = filename.replace(/\.[^/.]+$/, "");
    if (stem && stem.length > 2) return stem;
  } catch {}
  return `${fallbackId}-${suffix}`;
}

async function migrateSingleImage(productId, imageUrl, publicId, suffix, dryRun) {
  const baseName = publicId || extractBaseName(imageUrl, productId, suffix);
  const baseKey = `products/${baseName}`;

  if (dryRun) {
    return {
      url: r2KeyToUrl(`${baseKey}-thumb.webp`),
      urlStandard: r2KeyToUrl(`${baseKey}-standard.webp`),
      urlFull: r2KeyToUrl(`${baseKey}-full.webp`),
      key: `${baseKey}-thumb.webp`,
      keyStandard: `${baseKey}-standard.webp`,
      keyFull: `${baseKey}-full.webp`,
    };
  }

  const inputBuffer = await downloadImage(imageUrl);
  const variants = await processVariants(inputBuffer);
  const result = {};
  for (const v of variants) {
    const key = `${baseKey}-${v.name}.webp`;
    const url = await uploadVariant(key, v.buffer);
    result[v.name] = { url, key };
  }
  return {
    url: result.thumb.url,
    urlStandard: result.standard.url,
    urlFull: result.full.url,
    key: result.thumb.key,
    keyStandard: result.standard.key,
    keyFull: result.full.key,
  };
}

async function migrateProduct(product, dryRun, log) {
  const pid = product._id.toString();

  try {
    // Skip if already migrated (unless --force)
    if (!FORCE && product.r2Image) {
      log.push({ id: pid, name: product.name, status: "skipped", reason: "already_migrated" });
      return "skipped";
    }

    // Collect all image URLs to process
    const allImages = product.images?.length
      ? product.images
      : product.image ? [product.image] : [];

    const publicIds = product.imagePublicIds?.length
      ? product.imagePublicIds
      : product.imagePublicId ? [product.imagePublicId] : [];

    if (allImages.length === 0) {
      log.push({ id: pid, name: product.name, status: "skipped", reason: "no_images" });
      return "skipped";
    }

    // Migrate each image
    const r2Images = [], r2ImagesStandard = [], r2ImagesFull = [];
    const r2Keys = [], r2KeysStandard = [], r2KeysFull = [];

    for (let i = 0; i < allImages.length; i++) {
      const pubId = publicIds[i] || "";
      const result = await migrateSingleImage(pid, allImages[i], pubId, String(i), dryRun);
      r2Images.push(result.url);
      r2ImagesStandard.push(result.urlStandard);
      r2ImagesFull.push(result.urlFull);
      r2Keys.push(result.key);
      r2KeysStandard.push(result.keyStandard);
      r2KeysFull.push(result.keyFull);
    }

    // Primary image = first in gallery
    const update = {
      r2Image: r2Images[0],
      r2ImageStandard: r2ImagesStandard[0],
      r2ImageFull: r2ImagesFull[0],
      r2Key: r2Keys[0],
      r2KeyStandard: r2KeysStandard[0],
      r2KeyFull: r2KeysFull[0],
      r2Images,
      r2ImagesStandard,
      r2ImagesFull,
      r2Keys,
      r2KeysStandard,
      r2KeysFull,
    };

    if (!dryRun) {
      await Product.updateOne({ _id: product._id }, { $set: update });
    }

    log.push({ id: pid, name: product.name, status: "success", imageCount: allImages.length, r2Image: r2Images[0] });
    return "success";
  } catch (err) {
    log.push({ id: pid, name: product.name, status: "error", error: err.message });
    return "error";
  }
}

// ── Main ──

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");
  if (!process.env.R2_ACCOUNT_ID) throw new Error("R2_ACCOUNT_ID not set in .env.local");

  const dryRun = !EXECUTE;

  console.log("\n────────────────────────────────────────────────");
  console.log(" Drip Essentials — Cloudflare R2 Image Migration");
  console.log("────────────────────────────────────────────────");
  console.log(`Mode:        ${dryRun ? "DRY RUN (no changes will be made)" : "EXECUTE (writing to R2 + MongoDB)"}`);
  console.log(`Force:       ${FORCE}`);
  console.log(`Start from:  ${START_FROM || "beginning"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Bucket:      ${BUCKET}`);
  console.log(`Public URL:  ${R2_PUBLIC_URL}`);
  console.log("────────────────────────────────────────────────\n");

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB\n");

  // Build query
  const query = {};
  if (!FORCE) {
    query.r2Image = { $in: [null, undefined, ""] };
  }

  let products = await Product.find(query)
    .sort({ _id: 1 })
    .select("_id name brand image images imagePublicId imagePublicIds r2Image status")
    .lean();

  if (START_FROM) {
    const startIdx = products.findIndex((p) => p._id.toString() === START_FROM);
    if (startIdx === -1) {
      console.error(`Error: --start-from product ID "${START_FROM}" not found.`);
      process.exit(1);
    }
    products = products.slice(startIdx);
    console.log(`Starting from product ${START_FROM} (index ${startIdx})`);
  }

  const totalImages = products.reduce((sum, p) => {
    return sum + (p.images?.length || (p.image ? 1 : 0));
  }, 0);

  console.log(`Products to migrate: ${products.length}`);
  console.log(`Total image URLs:    ${totalImages}`);
  console.log(`R2 objects to create: ~${totalImages * 3} (3 WebP variants each)\n`);

  if (dryRun) {
    console.log("⚠  DRY RUN: No images will be downloaded, no R2 uploads, no DB writes.");
    console.log("   Run with --execute to perform the actual migration.\n");
    await mongoose.disconnect();
    return;
  }

  // Confirm before executing
  console.log("Starting migration in 3 seconds... (Ctrl+C to abort)\n");
  await new Promise((r) => setTimeout(r, 3000));

  const log = [];
  let success = 0, errors = 0, skipped = 0;
  const limit = pLimit(CONCURRENCY);

  const tasks = products.map((product, idx) =>
    limit(async () => {
      process.stdout.write(`[${idx + 1}/${products.length}] ${product.name?.slice(0, 40)}...`);
      const status = await migrateProduct(product, false, log);
      if (status === "success") { success++; process.stdout.write(" ✓\n"); }
      else if (status === "error") { errors++; process.stdout.write(" ✗\n"); }
      else { skipped++; process.stdout.write(" (skip)\n"); }
    })
  );

  await Promise.all(tasks);

  // Write log
  const logPath = new URL("../migration-log.json", import.meta.url).pathname;
  writeFileSync(logPath, JSON.stringify({ summary: { success, errors, skipped }, log }, null, 2));

  console.log("\n────────────────────────────────────────────────");
  console.log(` Migration Complete`);
  console.log(`  ✓ Success: ${success}`);
  console.log(`  ✗ Errors:  ${errors}`);
  console.log(`  ⊘ Skipped: ${skipped}`);
  console.log(`  Log: ${logPath}`);
  console.log("────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
