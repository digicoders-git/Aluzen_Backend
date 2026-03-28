import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  fullName:        { type: String, required: true, trim: true },
  phone:           { type: String, required: true, trim: true },
  email:           { type: String, required: true, trim: true, lowercase: true },
  productCategory: { type: String, required: true, trim: true },
  projectType:     { type: String, required: true, trim: true },
  projectDetails:  { type: String, trim: true, default: "" },
  read:            { type: Boolean, default: false },
}, { timestamps: true });

export const Quote = mongoose.model("Quote", quoteSchema);
