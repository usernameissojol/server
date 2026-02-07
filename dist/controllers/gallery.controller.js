"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteGalleryItems = exports.deleteGalleryItem = exports.uploadGalleryItem = exports.getGalleryItems = void 0;
const prisma_1 = require("../lib/prisma");
const getGalleryItems = async (req, res) => {
    try {
        const items = await prisma_1.prisma.gallery.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching gallery", error: error.message });
    }
};
exports.getGalleryItems = getGalleryItems;
const uploadGalleryItem = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ status: "error", message: "No files uploaded" });
        }
        const savedItems = [];
        for (const file of files) {
            const item = await prisma_1.prisma.gallery.create({
                data: {
                    image: `uploads/gallery/${file.filename}`,
                    title: file.originalname,
                    category: 'General'
                }
            });
            savedItems.push(item);
        }
        res.json({ status: "success", message: "Images uploaded successfully", images: savedItems });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error uploading images", error: error.message });
    }
};
exports.uploadGalleryItem = uploadGalleryItem;
const deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.gallery.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Item deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting item", error: error.message });
    }
};
exports.deleteGalleryItem = deleteGalleryItem;
const bulkDeleteGalleryItems = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        }
        await prisma_1.prisma.gallery.deleteMany({
            where: { id: { in: ids } }
        });
        res.json({ status: "success", message: "Items deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting items", error: error.message });
    }
};
exports.bulkDeleteGalleryItems = bulkDeleteGalleryItems;
