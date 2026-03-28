import { Category } from "../models/category.models.js";
import { Product } from "../models/product.models.js";

const toSlug = (name) => name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// GET — filter by ?type=product or ?type=project
export const getCategories = async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Categories fetched!", data: categories });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ADD — type required in body
export const addCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Category name is required." });
    if (!["product", "project", "blog"].includes(type))
      return res.status(400).json({ message: "type must be 'product', 'project' or 'blog'." });

    const slug = toSlug(name);
    const existing = await Category.findOne({ slug, type });
    if (existing) return res.status(400).json({ message: "Category already exists." });

    const category = await Category.create({ name: name.trim(), slug, type });
    return res.status(201).json({ message: "Category added!", data: category });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Category name is required." });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    const slug = toSlug(name);
    const existing = await Category.findOne({ slug, type: category.type, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: "Category name already taken." });

    const oldName = category.name;
    category.name = name.trim();
    category.slug = slug;
    await category.save();

    if (category.type === "product") {
      await Product.updateMany({ category: oldName }, { category: name.trim() });
    }

    return res.status(200).json({ message: "Category updated!", data: category });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// DELETE
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    if (category.type === "product") {
      const count = await Product.countDocuments({ category: category.name });
      if (count > 0)
        return res.status(400).json({ message: `Cannot delete — ${count} product(s) use this category.` });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Category deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
