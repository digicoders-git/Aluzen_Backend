import { Blog } from "../models/blog.models.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: "aluzen/blogs" });
  return result.secure_url;
};

const saveLocalCopy = (filePath, filename) => {
  const localDir = "uploads/blogs";
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
  const dest = path.join(localDir, filename);
  fs.copyFileSync(filePath, dest);
  return `/uploads/blogs/${filename}`;
};

const cleanTemp = (filePath) => {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// GET all blogs (public — only published)
export const getBlogs = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { published: true };
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Blogs fetched!", data: blogs });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// GET single blog
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });
    return res.status(200).json({ message: "Blog fetched!", data: blog });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ADD blog
export const addBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, readTime, featured, published } = req.body;
    if (!title?.trim() || !excerpt?.trim() || !category?.trim())
      return res.status(400).json({ message: "Title, excerpt and category are required." });
    if (!req.file)
      return res.status(400).json({ message: "Blog image is required." });

    const cloudinaryUrl = await uploadToCloudinary(req.file.path);
    const localUrl = saveLocalCopy(req.file.path, req.file.filename);
    cleanTemp(req.file.path);

    const blog = await Blog.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content?.trim() || "",
      category: category.trim(),
      readTime: readTime?.trim() || "",
      featured: featured === "true" || featured === true,
      published: published !== "false" && published !== false,
      image: cloudinaryUrl,
      localImage: localUrl,
    });

    return res.status(201).json({ message: "Blog added!", data: blog });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// UPDATE blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const { title, excerpt, content, category, readTime, featured, published } = req.body;

    if (title) blog.title = title.trim();
    if (excerpt) blog.excerpt = excerpt.trim();
    if (content !== undefined) blog.content = content.trim();
    if (category) blog.category = category.trim();
    if (readTime !== undefined) blog.readTime = readTime.trim();
    if (featured !== undefined) blog.featured = featured === "true" || featured === true;
    if (published !== undefined) blog.published = published !== "false" && published !== false;

    if (req.file) {
      const cloudinaryUrl = await uploadToCloudinary(req.file.path);
      const localUrl = saveLocalCopy(req.file.path, req.file.filename);
      cleanTemp(req.file.path);
      blog.image = cloudinaryUrl;
      blog.localImage = localUrl;
    }

    await blog.save();
    return res.status(200).json({ message: "Blog updated!", data: blog });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// DELETE blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    // Delete local copy if exists
    if (blog.localImage) {
      const localPath = path.join(process.cwd(), blog.localImage);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }

    await Blog.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Blog deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
