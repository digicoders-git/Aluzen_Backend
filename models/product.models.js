import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  specs: [{ type: String, trim: true }],
  image: { type: String, default: "" },
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
