import { Product } from "../models/product.models.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

const LOCAL_DIR = "uploads/products";

// ensure local products folder exists
if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });

const parseSpecs = (specs) => {
  if (!specs) return [];
  if (Array.isArray(specs)) return specs.map(s => s.trim()).filter(Boolean);
  try { return JSON.parse(specs); } catch { return specs.split(",").map(s => s.trim()).filter(Boolean); }
};

const uploadImage = async (file) => {
  // Save locally
  const ext = path.extname(file.originalname);
  const localName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
  const localPath = path.join(LOCAL_DIR, localName);
  fs.copyFileSync(file.path, localPath);

  // Upload to Cloudinary
  let cloudUrl = "";
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "aluzen_products",
      resource_type: "auto",
    });
    cloudUrl = result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed, using local:", err.message);
  }

  // Delete temp file
  fs.unlink(file.path, () => {});

  return {
    localPath: `/uploads/products/${localName}`,
    cloudUrl,
    // prefer Cloudinary URL, fallback to local
    imageUrl: cloudUrl || `/uploads/products/${localName}`,
  };
};

const deleteOldImage = (imageUrl) => {
  if (!imageUrl) return;
  // Delete local file if it's a local path
  if (imageUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), imageUrl);
    if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
  }
  // Delete from Cloudinary if it's a cloudinary URL
  if (imageUrl.includes("cloudinary.com")) {
    const parts = imageUrl.split("/");
    const fileWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileWithExt.split(".")[0]}`;
    cloudinary.uploader.destroy(publicId).catch(() => {});
  }
};

// Add product
export const addProduct = async (req, res) => {
  try {
    const { name, category, description, specs } = req.body;

    if (!name?.trim() || !category?.trim()) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Name and category are required." });
    }

    let imageUrl = "";
    if (req.file) {
      const uploaded = await uploadImage(req.file);
      imageUrl = uploaded.imageUrl;
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || "",
      specs: parseSpecs(specs),
      image: imageUrl,
    });

    return res.status(201).json({ message: "Product added!", data: product });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Products fetched!", data: products });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get unique categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    return res.status(200).json({ message: "Categories fetched!", data: categories });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    deleteOldImage(product.image);
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Product deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, category, description, specs } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Product not found!" });
    }

    let imageUrl = product.image;
    if (req.file) {
      deleteOldImage(product.image);
      const uploaded = await uploadImage(req.file);
      imageUrl = uploaded.imageUrl;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim() || product.name,
        category: category?.trim() || product.category,
        description: description?.trim() ?? product.description,
        specs: specs ? parseSpecs(specs) : product.specs,
        image: imageUrl,
      },
      { new: true }
    );

    return res.status(200).json({ message: "Product updated!", data: updated });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
