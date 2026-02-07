"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBanners = exports.getAllBannersAdmin = void 0;
const prisma_1 = require("../lib/prisma");
// For admin panel - get all banners regardless of status
const getAllBannersAdmin = async (req, res) => {
    try {
        const banners = await prisma_1.prisma.banners.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching banners", error: error.message });
    }
};
exports.getAllBannersAdmin = getAllBannersAdmin;
// For frontend - get only active banners
const getBanners = async (req, res) => {
    try {
        const banners = await prisma_1.prisma.banners.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching banners", error: error.message });
    }
};
exports.getBanners = getBanners;
const createBanner = async (req, res) => {
    try {
        const data = req.body;
        let imagePath = data.image;
        // Handle file upload
        if (req.file) {
            imagePath = `uploads/banners/${req.file.filename}`;
        }
        // Handle gallery image selection
        else if (data.image_path) {
            imagePath = data.image_path;
        }
        const banner = await prisma_1.prisma.banners.create({
            data: {
                title: data.title || '',
                subtitle: data.subtitle,
                image: imagePath || '',
                link: data.link,
                position: data.position || 'home',
                order: parseInt(data.order) || 0,
                status: data.status || 'active'
            }
        });
        res.status(201).json({ status: "success", message: "Banner created successfully", id: banner.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating banner", error: error.message });
    }
};
exports.createBanner = createBanner;
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = {
            title: data.title !== undefined ? data.title : undefined,
            subtitle: data.subtitle,
            link: data.link,
            position: data.position,
            order: data.order ? parseInt(data.order) : undefined,
            status: data.status
        };
        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = `uploads/banners/${req.file.filename}`;
        }
        else if (data.image_path) {
            updateData.image = data.image_path;
        }
        await prisma_1.prisma.banners.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ status: "success", message: "Banner updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating banner", error: error.message });
    }
};
exports.updateBanner = updateBanner;
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.banners.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Banner deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting banner", error: error.message });
    }
};
exports.deleteBanner = deleteBanner;
