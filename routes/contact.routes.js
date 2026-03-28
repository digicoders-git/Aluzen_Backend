import express from "express";
import { submitContact, getContacts, markAsRead, markAllAsRead, deleteContact } from "../controllers/contact.controllers.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const contactRoute = express.Router();

contactRoute.post("/submit", submitContact);
contactRoute.get("/get", verifyAdminToken, getContacts);
contactRoute.patch("/read/:id", verifyAdminToken, markAsRead);
contactRoute.patch("/read-all", verifyAdminToken, markAllAsRead);
contactRoute.delete("/delete/:id", verifyAdminToken, deleteContact);
