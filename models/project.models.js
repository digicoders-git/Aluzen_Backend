import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true // e.g., 'Residential', 'Commercial' (for display)
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // local path or filename
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
