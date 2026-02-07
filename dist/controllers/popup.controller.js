"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePopup = exports.updatePopup = exports.createPopup = exports.getPopups = void 0;
const prisma_1 = require("../lib/prisma");
const getPopups = async (req, res) => {
    try {
        const popups = await prisma_1.prisma.popups.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(popups);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching popups", error: error.message });
    }
};
exports.getPopups = getPopups;
const createPopup = async (req, res) => {
    try {
        const data = req.body;
        let imagePath = data.image;
        // Handle file upload
        if (req.file) {
            imagePath = `uploads/popups/${req.file.filename}`;
        }
        // Handle gallery image selection
        else if (data.image_path) {
            imagePath = data.image_path;
        }
        const popup = await prisma_1.prisma.popups.create({
            data: {
                title: data.title,
                content: data.content,
                image: imagePath || null,
                button_text: data.button_text,
                button_link: data.button_link,
                delay: parseInt(data.delay) || 3000, // Default 3000ms
                frequency: data.frequency || 'session',
                status: data.status || 'active'
            }
        });
        res.status(201).json({ status: "success", message: "Popup created successfully", id: popup.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating popup", error: error.message });
    }
};
exports.createPopup = createPopup;
const updatePopup = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = {
            title: data.title,
            content: data.content,
            button_text: data.button_text,
            button_link: data.button_link,
            delay: data.delay ? parseInt(data.delay) : undefined,
            frequency: data.frequency,
            status: data.status
        };
        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = `uploads/popups/${req.file.filename}`;
        }
        else if (data.image_path) {
            updateData.image = data.image_path;
        }
        await prisma_1.prisma.popups.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ status: "success", message: "Popup updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating popup", error: error.message });
    }
};
exports.updatePopup = updatePopup;
const deletePopup = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.popups.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Popup deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting popup", error: error.message });
    }
};
exports.deletePopup = deletePopup;
