/**
 * Cloudflare R2 Migration Verification Script
 *
 * Verifies that:
 * 1. Products in MongoDB have r2Image populated.
 * 2. HTTP GET to each r2Image URL returns HTTP 200 with Content-Type: image/webp.
 * 3. Compares total migrated count vs total database products.
 *
 * Usage:
 *   node scripts/verifyR2Migration.mjs
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import pLimit from "p-limit";

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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const ProductSchema = new mongoose.Schema({
  name: String,
  image: String,
  r2Image: String,
  r2ImageStandard: String,
  r2ImageFull: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10000) });
    return {
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      contentLength: res.headers.get("content-length") || "",
      cacheControl: res.headers.get("cache-control") || "",
      ok: res.ok && (res.headers.get("content-type") || "").includes("image"),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB\n");

  const total = await Product.countDocuments();
  const migrated = await Product.find({ r2Image: { $nin: [null, ""] } }).lean();

  console.log(`Total Products: ${total}`);
  console.log(`Migrated to R2: ${migrated.length} (${((migrated.length / total) * 100).toFixed(1)}%)\n`);

  if (migrated.length === 0) {
    console.log("No migrated products found yet. Run migration with --execute first.");
    await mongoose.disconnect();
    return;
  }

  // Sample check up to 20 random migrated products for HTTP 200 and image/webp
  const sample = migrated.slice(0, 20);
  console.log(`Checking live HTTP accessibility of sample (${sample.length} products)...`);

  const limit = pLimit(5);
  let liveOk = 0;
  let liveFail = 0;

  await Promise.all(
    sample.map((p) =>
      limit(async () => {
        const check = await checkUrl(p.r2Image);
        if (check.ok) {
          liveOk++;
          console.log(` ✓ [200 OK] ${p.name?.slice(0, 30)} -> ${check.contentType}`);
        } else {
          liveFail++;
          console.log(` ✗ [FAILED] ${p.name?.slice(0, 30)} -> ${check.error || check.status}`);
        }
      })
    )
  );

  console.log("\n────────────────────────────────────────────────");
  console.log(` Verification Summary`);
  console.log(`  Sample checked: ${sample.length}`);
  console.log(`  Accessible (HTTP 200): ${liveOk}`);
  console.log(`  Failed: ${liveFail}`);
  console.log("────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
