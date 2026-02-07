"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCarousel = exports.updateCarousel = exports.createCarousel = exports.getCarousels = exports.getAllCarouselsAdmin = void 0;
const prisma_1 = require("../lib/prisma");
// For admin panel - get all carousels regardless of status
const getAllCarouselsAdmin = async (req, res) => {
    try {
        const carousels = await prisma_1.prisma.carousels.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching carousels", error: error.message });
    }
};
exports.getAllCarouselsAdmin = getAllCarouselsAdmin;
// For frontend - get only active carousels
const getCarousels = async (req, res) => {
    try {
        const carousels = await prisma_1.prisma.carousels.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching carousels", error: error.message });
    }
};
exports.getCarousels = getCarousels;
const createCarousel = async (req, res) => {
    try {
        const data = req.body;
        let imagePath = data.image;
        // Handle file upload
        if (req.file) {
            imagePath = `uploads/carousels/${req.file.filename}`;
        }
        // Handle gallery image selection
        else if (data.image_path) {
            imagePath = data.image_path;
        }
        const carousel = await prisma_1.prisma.carousels.create({
            data: {
                title: data.title || '',
                description: data.description,
                image: imagePath || '',
                link: data.link,
                button_text: data.button_text,
                order: parseInt(data.order) || 0,
                status: data.status || 'active'
            }
        });
        res.status(201).json({ status: "success", message: "Carousel created successfully", id: carousel.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating carousel", error: error.message });
    }
};
exports.createCarousel = createCarousel;
const updateCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = {
            title: data.title !== undefined ? data.title : undefined,
            description: data.description,
            link: data.link,
            button_text: data.button_text,
            order: data.order ? parseInt(data.order) : undefined,
            status: data.status
        };
        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = `uploads/carousels/${req.file.filename}`;
        }
        else if (data.image_path) {
            updateData.image = data.image_path;
        }
        await prisma_1.prisma.carousels.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ status: "success", message: "Carousel updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating carousel", error: error.message });
    }
};
exports.updateCarousel = updateCarousel;
const deleteCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.carousels.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Carousel deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting carousel", error: error.message });
    }
};
exports.deleteCarousel = deleteCarousel;
