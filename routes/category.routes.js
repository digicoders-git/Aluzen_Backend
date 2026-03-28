import express from "express";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../controllers/category.controllers.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const categoryRoute = express.Router();

// Public
categoryRoute.get("/get", getCategories);

// Admin protected
categoryRoute.post("/add", verifyAdminToken, addCategory);
categoryRoute.put("/update/:id", verifyAdminToken, updateCategory);
categoryRoute.delete("/delete/:id", verifyAdminToken, deleteCategory);
