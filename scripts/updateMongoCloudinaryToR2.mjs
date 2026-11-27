/**
 * Direct Database Update: Replace Cloudinary URLs with Cloudflare R2 URLs
 *
 * Operation:
 * - Scans all documents in `products` collection.
 * - Extracts exact filename and extension from Cloudinary URLs:
 *   e.g. "https://res.cloudinary.com/dnqbhqi6/image/upload/v1794827765/0.3758946925714258.jpg"
 *   -> "https://images.dripessential.in/products/0.3758946925714258.jpg"
 * - Updates ONLY `image` and `images` fields.
 * - Does not modify updatedAt, imagePublicId, imagePublicIds, or any other field.
 * - Safe to rerun: URLs already using https://images.dripessential.in/products/ remain unchanged.
 */

import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";
import mongoose from "mongoose";

// Load .env.local
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

const R2_PREFIX = "https://images.dripessential.in/products/";
const CLOUDINARY_MARKER = "res.cloudinary.com";

function transformUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes(CLOUDINARY_MARKER)) return url; // Already R2 or non-Cloudinary

  const filename = url.split("/").pop().split("?")[0];
  return `${R2_PREFIX}${filename}`;
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in .env.local");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection("products");

  const allProducts = await collection.find({}).toArray();
  const totalScanned = allProducts.length;

  let docsToUpdate = 0;
  let imageFieldsUpdated = 0;
  let imagesArrayUrlsUpdated = 0;
  let docsUnchanged = 0;

  const bulkOps = [];

  for (const product of allProducts) {
    const updateSet = {};
    let hasChanges = false;

    // 1. Check primary `image`
    if (product.image && typeof product.image === "string" && product.image.includes(CLOUDINARY_MARKER)) {
      const newImage = transformUrl(product.image);
      if (newImage !== product.image) {
        updateSet.image = newImage;
        imageFieldsUpdated++;
        hasChanges = true;
      }
    }

    // 2. Check `images` array
    if (Array.isArray(product.images) && product.images.length > 0) {
      let arrayChanged = false;
      const newImages = product.images.map((imgUrl) => {
        if (imgUrl && typeof imgUrl === "string" && imgUrl.includes(CLOUDINARY_MARKER)) {
          const transformed = transformUrl(imgUrl);
          if (transformed !== imgUrl) {
            imagesArrayUrlsUpdated++;
            arrayChanged = true;
          }
          return transformed;
        }
        return imgUrl;
      });

      if (arrayChanged) {
        updateSet.images = newImages;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      docsToUpdate++;
      bulkOps.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: updateSet },
        },
      });
    } else {
      docsUnchanged++;
    }
  }

  console.log(`\nExecution Plan:`);
  console.log(`- Total documents scanned: ${totalScanned}`);
  console.log(`- Documents requiring update: ${docsToUpdate}`);
  console.log(`- Documents unchanged: ${docsUnchanged}`);
  console.log(`- 'image' fields to update: ${imageFieldsUpdated}`);
  console.log(`- 'images' array items to update: ${imagesArrayUrlsUpdated}`);

  if (bulkOps.length > 0) {
    console.log(`\nExecuting bulkWrite (${bulkOps.length} operations)...`);
    const result = await collection.bulkWrite(bulkOps, { ordered: false });
    console.log(`✓ bulkWrite completed: ${result.modifiedCount} documents modified in MongoDB Atlas.`);
  } else {
    console.log("\nNo documents required updating. All URLs already use R2 or non-Cloudinary destinations.");
  }

  // Verification step: Sample check 5 updated documents
  console.log("\nSample 5 verified documents post-update:");
  const sample = await collection.find({}).limit(5).toArray();
  sample.forEach((p) => {
    console.log(`- [${p.name}]`);
    console.log(`  image:  ${p.image}`);
    console.log(`  images: ${JSON.stringify(p.images)}`);
  });

  // Verify no Cloudinary URLs remain
  const remainingCloudinary = await collection.countDocuments({
    $or: [
      { image: { $regex: CLOUDINARY_MARKER } },
      { images: { $elemMatch: { $regex: CLOUDINARY_MARKER } } },
    ],
  });
  console.log(`\nVerification: Remaining Cloudinary URLs in collection: ${remainingCloudinary}`);

  await mongoose.disconnect();
  console.log("Database connection closed.");

  return {
    totalScanned,
    docsUpdated: docsToUpdate,
    imageFieldsUpdated,
    imagesArrayUrlsUpdated,
    docsUnchanged,
    remainingCloudinary,
  };
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
