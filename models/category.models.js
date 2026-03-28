import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true },
  type: { type: String, enum: ["product", "project", "blog"], required: true, default: "product" },
}, { timestamps: true });

// unique per type — same name can exist for product and project separately
categorySchema.index({ slug: 1, type: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);
