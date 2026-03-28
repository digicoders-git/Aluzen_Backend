import express from "express";
import { addProject, getProjects, deleteProject, updateProject } from "../controllers/project.controllers.js";
import upload from "../middlewares/multer.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

const projectRoute = express.Router();

projectRoute.get("/get", getProjects);
projectRoute.post("/add", verifyAdminToken, upload.single("image"), addProject);
projectRoute.put("/update/:id", verifyAdminToken, upload.single("image"), updateProject);
projectRoute.delete("/delete/:id", verifyAdminToken, deleteProject);

export { projectRoute };
