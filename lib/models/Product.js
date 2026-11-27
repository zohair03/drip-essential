import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Brand",
      required: [true, "Brand is required"],
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    // Main image
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    // Additional images
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },

    // ── Cloudflare R2 image fields (added alongside Cloudinary for gradual migration) ──
    // Primary image variants (pre-optimized WebP via Sharp)
    r2Image: { type: String, default: null },         // 400px WebP URL
    r2ImageStandard: { type: String, default: null },  // 800px WebP URL
    r2ImageFull: { type: String, default: null },      // 1200px WebP URL
    // R2 object keys (used for deletion)
    r2Key: { type: String, default: null },            // 400px key
    r2KeyStandard: { type: String, default: null },    // 800px key
    r2KeyFull: { type: String, default: null },        // 1200px key
    // Gallery image variants
    r2Images: { type: [String], default: [] },         // gallery 400px URLs
    r2ImagesStandard: { type: [String], default: [] }, // gallery 800px URLs
    r2ImagesFull: { type: [String], default: [] },     // gallery 1200px URLs
    r2Keys: { type: [String], default: [] },           // gallery 400px keys
    r2KeysStandard: { type: [String], default: [] },   // gallery 800px keys
    r2KeysFull: { type: [String], default: [] },       // gallery 1200px keys

    status: {
      type: String,
      enum: ["Active", "Draft"],
      default: "Active",
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual `id` field returns _id as string — existing frontend expects `id` not `_id`
ProductSchema.virtual("id").get(function () {
  return this._id.toString();
});

// Ensure schema changes are always picked up even across HMR/hot reloads
if (
  mongoose.models.Product &&
  (!mongoose.models.Product.schema.paths.order ||
    !mongoose.models.Product.schema.paths.r2Image)
) {
  delete mongoose.models.Product;
}

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
