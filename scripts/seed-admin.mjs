import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) {
    console.error(".env.local not found at", envPath);
    return;
  }
  const content = readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@dripessentials.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Drip2026";

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI not set in .env.local");
  process.exit(1);
}

// Schemas
const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    slug: { type: String, unique: true },
    image: String,
    imagePublicId: String,
    description: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    description: String,
    price: Number,
    stock: Number,
    image: String,
    imagePublicId: String,
    images: [String],
    imagePublicIds: [String],
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
  const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
  const Product =
    mongoose.models.Product || mongoose.model("Product", ProductSchema);

  // 1. Seed Admin
  const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }

  // 2. Seed Brands if none exist
  const brandCount = await Brand.countDocuments();
  if (brandCount === 0) {
    console.log("Seeding initial brands...");
    const initialBrands = [
      { name: "ROLEX", slug: "rolex", description: "A crown for every achievement." },
      { name: "TAG HEUER", slug: "tag-heuer", description: "Swiss Avant-Garde Since 1860." },
      { name: "OMEGA", slug: "omega", description: "Exact time for life." },
      { name: "SEIKO", slug: "seiko", description: "Always one step ahead of the rest." },
      { name: "TUDOR", slug: "tudor", description: "Born To Dare." },
      { name: "RADO", slug: "rado", description: "Master of materials." },
      { name: "LOUIS ERARD", slug: "louis-erard", description: "Swiss mechanical excellence." },
      { name: "G-SHOCK", slug: "g-shock", description: "The toughest watches in the world." },
      { name: "FOSSIL", slug: "fossil", description: "Vintage-inspired modern classics." },
    ];
    await Brand.insertMany(initialBrands);
    console.log(`Seeded ${initialBrands.length} brands!`);
  }

  // 3. Seed Products if none exist
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log("Seeding initial products...");
    const rolex = await Brand.findOne({ slug: "rolex" });
    const tag = await Brand.findOne({ slug: "tag-heuer" });
    const omega = await Brand.findOne({ slug: "omega" });
    const seiko = await Brand.findOne({ slug: "seiko" });

    const initialProducts = [
      {
        name: "Cosmograph Daytona",
        brand: rolex?._id,
        description:
          "The Oyster Perpetual Cosmograph Daytona is the ultimate tool watch for those with a passion for driving and speed.",
        price: 14800,
        stock: 8,
        image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642820/0.2767215335533455.png",
        imagePublicId: "0.2767215335533455",
        images: ["https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642820/0.2767215335533455.png"],
        imagePublicIds: ["0.2767215335533455"],
        status: "Active",
      },
      {
        name: "Aquaracer Professional 300",
        brand: tag?._id,
        description:
          "The definitive luxury diver's watch. Designed for underwater exploration with exceptional reliability.",
        price: 3450,
        stock: 5,
        image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642819/0.5506029047910815.png",
        imagePublicId: "0.5506029047910815",
        images: ["https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642819/0.5506029047910815.png"],
        imagePublicIds: ["0.5506029047910815"],
        status: "Active",
      },
      {
        name: "Speedmaster Moonwatch",
        brand: omega?._id,
        description:
          "One of the world's most iconic timepieces. Having been a part of all six lunar missions.",
        price: 6900,
        stock: 12,
        image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642818/0.17384543868989455.png",
        imagePublicId: "0.17384543868989455",
        images: ["https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642818/0.17384543868989455.png"],
        imagePublicIds: ["0.17384543868989455"],
        status: "Active",
      },
      {
        name: "Prospex Automatic",
        brand: seiko?._id,
        description:
          "Built for the challenge. A professional diver's watch with exceptional Japanese craftsmanship.",
        price: 85000,
        stock: 24,
        image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642816/0.24409238327789373.png",
        imagePublicId: "0.24409238327789373",
        images: ["https://res.cloudinary.com/dnqbhqi6/image/upload/v1794642816/0.24409238327789373.png"],
        imagePublicIds: ["0.24409238327789373"],
        status: "Active",
      },
    ];

    await Product.insertMany(initialProducts.filter((p) => p.brand));
    console.log("Seeded initial products!");
  }

  await mongoose.disconnect();
  console.log("Database seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
