"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteBrands = exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = void 0;
const prisma_1 = require("../lib/prisma");
const getBrands = async (req, res) => {
    try {
        const brands = await prisma_1.prisma.brands.findMany();
        res.json(brands);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching brands", error: error.message });
    }
};
exports.getBrands = getBrands;
const createBrand = async (req, res) => {
    try {
        const { name, image_path } = req.body;
        // Remove leading slash if it exists in the path
        const logo = req.file ? `uploads/brands/${req.file.filename}` : (image_path || null);
        const brand = await prisma_1.prisma.brands.create({
            data: { name, logo: logo ? logo.replace(/^\//, '') : null }
        });
        res.json({ status: "success", message: "Brand created successfully", id: brand.id });
    }
    catch (error) {
        console.error("Error creating brand:", error);
        res.status(500).json({ status: "error", message: "Error creating brand", error: error.message });
    }
};
exports.createBrand = createBrand;
const updateBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, image_path } = req.body;
        const data = { name };
        if (req.file) {
            data.logo = `uploads/brands/${req.file.filename}`;
        }
        else if (image_path) {
            data.logo = image_path.replace(/^\//, '');
        }
        await prisma_1.prisma.brands.update({
            where: { id },
            data
        });
        res.json({ status: "success", message: "Brand updated successfully" });
    }
    catch (error) {
        console.error("Error updating brand:", error);
        res.status(500).json({ status: "error", message: "Error updating brand", error: error.message });
    }
};
exports.updateBrand = updateBrand;
const deleteBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.brands.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Brand deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting brand", error: error.message });
    }
};
exports.deleteBrand = deleteBrand;
const bulkDeleteBrands = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs format" });
        }
        await prisma_1.prisma.brands.deleteMany({
            where: {
                id: { in: ids.map((id) => parseInt(id)) }
            }
        });
        res.json({ status: "success", message: "Brands deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
exports.bulkDeleteBrands = bulkDeleteBrands;
