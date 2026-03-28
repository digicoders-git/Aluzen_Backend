import { Quote } from "../models/quote.models.js";
import { pushNotification } from "../server.js";

export const submitQuote = async (req, res) => {
  try {
    const { fullName, phone, email, productCategory, projectType, projectDetails } = req.body;
    if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !productCategory?.trim() || !projectType?.trim())
      return res.status(400).json({ message: "All required fields must be filled." });

    const quote = await Quote.create({
      fullName: fullName.trim(), phone: phone.trim(),
      email: email.trim().toLowerCase(),
      productCategory: productCategory.trim(),
      projectType: projectType.trim(),
      projectDetails: projectDetails?.trim() || "",
    });
    pushNotification({ type: "quote", id: quote._id, title: "New Quote Request", desc: `${quote.fullName} — ${quote.productCategory}, ${quote.projectType}`, time: quote.createdAt, link: `/quotes` });
    return res.status(201).json({ message: "Quote request submitted successfully!", data: quote });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Quotes fetched!", data: quotes });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const readValue = req.query.unread === "true" ? false : true;
    const quote = await Quote.findByIdAndUpdate(req.params.id, { read: readValue }, { new: true });
    if (!quote) return res.status(404).json({ message: "Quote not found." });
    return res.status(200).json({ message: readValue ? "Marked as read!" : "Marked as unread!", data: quote });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Quote.updateMany({ read: false }, { read: true });
    return res.status(200).json({ message: "All marked as read!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found." });
    await Quote.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Quote deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
