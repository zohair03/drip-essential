import mongoose from "mongoose";

const FeaturedItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["showcase", "bestseller"],
      required: [true, "Section type is required"],
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Prevent adding the same product twice to the same section
FeaturedItemSchema.index({ type: 1, product: 1 }, { unique: true });

FeaturedItemSchema.set("toJSON", { virtuals: true });
FeaturedItemSchema.set("toObject", { virtuals: true });

const FeaturedItem =
  mongoose.models.FeaturedItem ||
  mongoose.model("FeaturedItem", FeaturedItemSchema);

export default FeaturedItem;
