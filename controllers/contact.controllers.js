import { Contact } from "../models/contact.models.js";
import { pushNotification } from "../server.js";

export const submitContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !message?.trim())
      return res.status(400).json({ message: "All fields are required." });
    const contact = await Contact.create({ name: name.trim(), phone: phone.trim(), email: email.trim().toLowerCase(), message: message.trim() });
    // Push real-time notification
    pushNotification({ type: "enquiry", id: contact._id, title: "New Enquiry", desc: `${contact.name} — ${contact.message?.slice(0, 60)}`, time: contact.createdAt, link: `/contact-details/${contact._id}` });
    return res.status(201).json({ message: "Enquiry submitted successfully!", data: contact });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Contacts fetched!", data: contacts });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const readValue = req.query.unread === "true" ? false : true;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: readValue }, { new: true });
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    return res.status(200).json({ message: readValue ? "Marked as read!" : "Marked as unread!", data: contact });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Contact.updateMany({ read: false }, { read: true });
    return res.status(200).json({ message: "All marked as read!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    await Contact.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Contact deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
