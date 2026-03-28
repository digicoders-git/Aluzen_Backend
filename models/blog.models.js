import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  excerpt:  { type: String, required: true, trim: true },
  content:  { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  image:    { type: String, required: true },
  localImage: { type: String },
  readTime: { type: String, trim: true },
  featured: { type: Boolean, default: false },
  published:{ type: Boolean, default: true },
}, { timestamps: true });

export const Blog = mongoose.model("Blog", blogSchema);
