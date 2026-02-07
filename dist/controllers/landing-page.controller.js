"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = exports.deleteLandingPage = exports.updateLandingPage = exports.createLandingPage = exports.getLandingPageByParam = exports.getLandingPages = void 0;
const prisma_1 = require("../lib/prisma");
const getLandingPages = async (req, res) => {
    try {
        const pages = await prisma_1.prisma.landing_pages.findMany({
            orderBy: { created_at: 'desc' }
        });
        // Parse content JSON string to object for each page
        const parsedPages = pages.map(page => ({
            ...page,
            content: typeof page.content === 'string' ? JSON.parse(page.content || '{}') : page.content
        }));
        res.json(parsedPages);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching landing pages", error: error.message });
    }
};
exports.getLandingPages = getLandingPages;
const getLandingPageByParam = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await prisma_1.prisma.landing_pages.findFirst({
            where: {
                OR: [
                    { slug: req.params.id },
                    ...(isNaN(parseInt(req.params.id)) ? [] : [{ id: parseInt(req.params.id) }])
                ]
            }
        });
        if (!page) {
            return res.status(404).json({ status: "error", message: "Landing page not found" });
        }
        // Parse content JSON string to object
        const parsedPage = {
            ...page,
            content: typeof page.content === 'string' ? JSON.parse(page.content || '{}') : page.content
        };
        res.json(parsedPage);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching landing page", error: error.message });
    }
};
exports.getLandingPageByParam = getLandingPageByParam;
const createLandingPage = async (req, res) => {
    try {
        const data = req.body;
        console.log("Creating landing page with data keys:", Object.keys(data));
        const content = typeof data.content === 'object' ? JSON.stringify(data.content) : data.content;
        const page = await prisma_1.prisma.landing_pages.create({
            data: {
                title: data.title,
                slug: data.slug,
                template: data.template?.toString(),
                status: data.status || 'Published',
                content: content || '',
                html_content: data.html_content,
                type: data.type || 'Landing'
            }
        });
        res.json({ status: "success", message: "Landing page created successfully", id: page.id });
    }
    catch (error) {
        console.error("Error creating landing page:", error);
        res.status(500).json({ status: "error", message: "Error creating landing page", error: error.message });
    }
};
exports.createLandingPage = createLandingPage;
const updateLandingPage = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const content = typeof data.content === 'object' ? JSON.stringify(data.content) : data.content;
        await prisma_1.prisma.landing_pages.update({
            where: { id: parseInt(id) },
            data: {
                title: data.title,
                slug: data.slug,
                template: data.template?.toString(),
                status: data.status,
                content: content,
                html_content: data.html_content,
                type: data.type
            }
        });
        res.json({ status: "success", message: "Landing page updated successfully" });
    }
    catch (error) {
        console.error("Error updating landing page:", error);
        res.status(500).json({ status: "error", message: "Error updating landing page", error: error.message });
    }
};
exports.updateLandingPage = updateLandingPage;
const deleteLandingPage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.landing_pages.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ status: "success", message: "Landing page deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting landing page", error: error.message });
    }
};
exports.deleteLandingPage = deleteLandingPage;
const getTemplates = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            const template = await prisma_1.prisma.landing_page_templates.findUnique({
                where: { id: parseInt(id) }
            });
            if (!template) {
                return res.status(404).json({ status: "error", message: "Template not found" });
            }
            return res.json(template);
        }
        const templates = await prisma_1.prisma.landing_page_templates.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching templates", error: error.message });
    }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res) => {
    try {
        const data = req.body;
        const template = await prisma_1.prisma.landing_page_templates.create({
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                preview_image: data.preview_image
            }
        });
        res.json({ status: "success", message: "Template created successfully", id: template.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating template", error: error.message });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        await prisma_1.prisma.landing_page_templates.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                preview_image: data.preview_image
            }
        });
        res.json({ status: "success", message: "Template updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating template", error: error.message });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.landing_page_templates.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Template deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting template", error: error.message });
    }
};
exports.deleteTemplate = deleteTemplate;
