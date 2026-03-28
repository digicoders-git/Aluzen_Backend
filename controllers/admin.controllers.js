import cloudinary from "../config/cloudinary.js";
import generateToken from "../config/token.js";
import Admin from "../models/admin.models.js";
import bcrypt from "bcryptjs";
import fs from "fs";

export const createAdmin = async (req,res) => {
  try {
    const {name, email, password} = req.body
    if(!name || !email || !password){
      return res.status(400).json({message:"All fields are required!"});
    }
    const existingAdmin = await Admin.find()
    if(existingAdmin.length > 0){
      return res.status(400).json({message:"Admin already exists!"})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePhotoUrl = "";
    if(req.file){
      const img = await cloudinary.uploader.upload(req.file.path, { folder: "admin_profile", resource_type: "auto" })
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      profilePhotoUrl = img.secure_url
    }
    const admin = await Admin.create({ name, email, password: hashedPassword, profilePhoto: profilePhotoUrl });
    return res.status(200).json({message:"Admin Created!", data:admin})
  } catch (error) {
    return res.status(500).json({message:"Internal Server Error!",error: error.message})
  }
}

export const login = async (req,res) => {
  try {
    const {email, password} = req.body
    if(!email) return res.status(400).json({message:"Please enter email"})
    if(!password) return res.status(400).json({message:"Please enter password"})
    const existAdmin = await Admin.findOne({email})
    if(!existAdmin) return res.status(404).json({message:"Admin not found!"})
    const passMatch = await bcrypt.compare(password, existAdmin.password)
    if(!passMatch) return res.status(400).json({message:"Invalid Password!"})
    const token = generateToken(existAdmin._id)
    return res.status(200).json({
      message: "Login Successfully!", token,
      user: { id: existAdmin._id, name: existAdmin.name, email: existAdmin.email, profilePhoto: existAdmin.profilePhoto }
    })
  } catch (error) {
    return res.status(500).json({message:"Internal Server Error!",error: error.message})
  }
}

export const get = async (req,res) => {
  try {
    const data = await Admin.find()
    return res.status(200).json({message:"Admin Data", data})
  } catch (error) {
    return res.status(500).json({message:"Internal Server Error!",error: error.message})
  }
}

export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found!" });

    const { name, email, currentPassword, newPassword } = req.body;

    if (name) admin.name = name.trim();
    if (email) admin.email = email.trim().toLowerCase();

    // Handle password change
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required to set a new password." });
      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match) return res.status(400).json({ message: "Current password is incorrect." });
      if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters." });
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle photo upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "admin_profile", resource_type: "auto" });
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      admin.profilePhoto = result.secure_url;
    }

    await admin.save();
    return res.status(200).json({
      message: "Profile updated!",
      data: { id: admin._id, name: admin.name, email: admin.email, profilePhoto: admin.profilePhoto }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
}