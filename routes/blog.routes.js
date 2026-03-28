import express from "express";
import { getBlogs, getBlogById, addBlog, updateBlog, deleteBlog } from "../controllers/blog.controllers.js";
import upload from "../middlewares/multer.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const blogRoute = express.Router();

// Public
blogRoute.get("/get", getBlogs);
blogRoute.get("/get/:id", getBlogById);

// Admin protected
blogRoute.post("/add", verifyAdminToken, upload.single("image"), addBlog);
blogRoute.put("/update/:id", verifyAdminToken, upload.single("image"), updateBlog);
blogRoute.delete("/delete/:id", verifyAdminToken, deleteBlog);
