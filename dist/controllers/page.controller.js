"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePage = exports.updatePage = exports.createPage = exports.getPageBySlug = exports.getPages = void 0;
const prisma_1 = require("../lib/prisma");
const getPages = async (req, res) => {
    try {
        const pages = await prisma_1.prisma.pages.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(pages);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching pages", error: error.message });
    }
};
exports.getPages = getPages;
const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await prisma_1.prisma.pages.findFirst({
            where: {
                OR: [
                    { slug: req.params.slug },
                    ...(isNaN(parseInt(req.params.slug)) ? [] : [{ id: parseInt(req.params.slug) }])
                ]
            }
        });
        if (!page)
            return res.status(404).json({ status: "error", message: "Page not found" });
        res.json(page);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching page", error: error.message });
    }
};
exports.getPageBySlug = getPageBySlug;
const createPage = async (req, res) => {
    try {
        const data = req.body;
        const page = await prisma_1.prisma.pages.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                type: data.type || 'Custom',
                status: data.status || 'published'
            }
        });
        res.json({ status: "success", message: "Page created successfully", id: page.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating page", error: error.message });
    }
};
exports.createPage = createPage;
const updatePage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.pages.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                type: data.type,
                status: data.status
            }
        });
        res.json({ status: "success", message: "Page updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating page", error: error.message });
    }
};
exports.updatePage = updatePage;
const deletePage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.pages.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Page deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting page", error: error.message });
    }
};
exports.deletePage = deletePage;
