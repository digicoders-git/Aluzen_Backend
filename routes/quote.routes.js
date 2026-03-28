import express from "express";
import { submitQuote, getQuotes, markAsRead, markAllAsRead, deleteQuote } from "../controllers/quote.controllers.js";
import { verifyAdminToken } from "../middlewares/verifyAdminToken.js";

export const quoteRoute = express.Router();

quoteRoute.post("/submit", submitQuote);
quoteRoute.get("/get", verifyAdminToken, getQuotes);
quoteRoute.patch("/read/:id", verifyAdminToken, markAsRead);
quoteRoute.patch("/read-all", verifyAdminToken, markAllAsRead);
quoteRoute.delete("/delete/:id", verifyAdminToken, deleteQuote);
