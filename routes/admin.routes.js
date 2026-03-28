import express from "express";
import { createAdmin, get, login, updateAdmin } from "../controllers/admin.controllers.js";
import upload from "../middlewares/multer.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const adminRoute = express.Router();

adminRoute.post("/login", login);
adminRoute.get("/get", verifyAdminToken, get);
adminRoute.post("/create", verifyAdminToken, upload.single("profilePhoto"), createAdmin);
adminRoute.put("/update/:id", verifyAdminToken, upload.single("profilePhoto"), updateAdmin);
