import mongoose from "mongoose";

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
BrandSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
  next();
});

BrandSchema.set("toJSON", { virtuals: true });
BrandSchema.set("toObject", { virtuals: true });

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

export default Brand;
