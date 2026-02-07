"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = require("../lib/prisma");
const getCategories = async (req, res) => {
    try {
        console.log("Fetching all categories...");
        const categories = await prisma_1.prisma.categories.findMany({
            orderBy: { priority: 'asc' }
        });
        console.log(`Found ${categories.length} categories`);
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ status: "error", message: "Error fetching categories", error: error.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const data = req.body;
        console.log("Creating category with data:", data);
        const image = req.file ? `uploads/categories/${req.file.filename}` : (data.image_path ? data.image_path.replace(/^\//, '') : null);
        // Ensure parent_id and priority are valid numbers or null
        const parent_id = data.parent_id && !isNaN(parseInt(data.parent_id)) ? parseInt(data.parent_id) : null;
        const priority = !isNaN(parseInt(data.priority)) ? parseInt(data.priority) : 0;
        const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
        // Check for existing slug to provide better error
        const existing = await prisma_1.prisma.categories.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ status: "error", message: `A category with slug "${slug}" already exists.` });
        }
        const category = await prisma_1.prisma.categories.create({
            data: {
                name: data.name,
                slug: slug,
                description: data.description || null,
                priority: priority,
                status: data.status || 'publish',
                show_on_home: data.show_on_home === '1' || data.show_on_home === true || data.show_on_home === 'true',
                parent_id: parent_id,
                icon: data.icon || null,
                image: image
            }
        });
        res.json({ status: "success", message: "Category created successfully", category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ status: "error", message: error.message || "Error creating category" });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        console.log(`Updating category ${id} with data:`, data);
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid category ID" });
        }
        const image = req.file ? `uploads/categories/${req.file.filename}` : (data.image_path ? data.image_path.replace(/^\//, '') : undefined);
        // Ensure parent_id and priority are valid numbers or null
        const parent_id = data.parent_id !== undefined ? (data.parent_id && !isNaN(parseInt(data.parent_id)) ? parseInt(data.parent_id) : null) : undefined;
        const priority = data.priority !== undefined ? (!isNaN(parseInt(data.priority)) ? parseInt(data.priority) : 0) : undefined;
        await prisma_1.prisma.categories.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                priority: priority,
                status: data.status,
                show_on_home: data.show_on_home === '1' || data.show_on_home === true || data.show_on_home === 'true',
                parent_id: parent_id,
                icon: data.icon,
                ...(image !== undefined && { image })
            }
        });
        res.json({ status: "success", message: "Category updated successfully" });
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ status: "error", message: "Error updating category", error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid category ID" });
        }
        // Check if category exists
        const category = await prisma_1.prisma.categories.findUnique({
            where: { id }
        });
        if (!category) {
            return res.status(404).json({ status: "error", message: "Category not found" });
        }
        await prisma_1.prisma.categories.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting category", error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
const bulkDeleteCategories = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs format" });
        }
        await prisma_1.prisma.categories.deleteMany({
            where: {
                id: { in: ids.map((id) => parseInt(id)) }
            }
        });
        res.json({ status: "success", message: "Categories deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
exports.bulkDeleteCategories = bulkDeleteCategories;
