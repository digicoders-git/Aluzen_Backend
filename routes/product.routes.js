import express from "express";
import { addProduct, getProducts, getCategories, deleteProduct, updateProduct } from "../controllers/product.controllers.js";
import upload from "../middlewares/multer.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const productRoute = express.Router();

// Public
productRoute.get("/get", getProducts);
productRoute.get("/categories", getCategories);

// Admin protected
productRoute.post("/add", verifyAdminToken, upload.single("image"), addProduct);
productRoute.put("/update/:id", verifyAdminToken, upload.single("image"), updateProduct);
productRoute.delete("/delete/:id", verifyAdminToken, deleteProduct);
