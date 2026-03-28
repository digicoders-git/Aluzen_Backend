import { Project } from "../models/project.models.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: "aluzen/projects" });
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return result.secure_url;
};

export const addProject = async (req, res) => {
  try {
    const { title, category, type, location, description } = req.body;
    if (!title || !category || !type || !location)
      return res.status(400).json({ message: "title, category, type, location are required." });
    if (!req.file)
      return res.status(400).json({ message: "Project image is required." });

    const imageUrl = await uploadToCloudinary(req.file.path);
    const project = await Project.create({ title, category, type, location, description, image: imageUrl });
    return res.status(201).json({ message: "Project added!", data: project });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: projects });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, category, type, location, description } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const updateData = { title, category, type, location, description };
    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.path);
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json({ message: "Project updated!", data: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    await Project.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Project deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
