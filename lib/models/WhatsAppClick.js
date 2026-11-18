import mongoose from "mongoose";

const WhatsAppClickSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Format: 'YYYY-MM' e.g. '2026-11'
    monthYear: {
      type: String,
      required: true,
    },
    clickCount: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index — one document per product per month
WhatsAppClickSchema.index({ productId: 1, monthYear: 1 }, { unique: true });

const WhatsAppClick =
  mongoose.models.WhatsAppClick ||
  mongoose.model("WhatsAppClick", WhatsAppClickSchema);

export default WhatsAppClick;
