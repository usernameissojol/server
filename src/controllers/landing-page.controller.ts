import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getLandingPages = async (req: Request, res: Response) => {
    try {
        const pages = await prisma.landing_pages.findMany({
            orderBy: { created_at: 'desc' }
        });

        // Parse content JSON string to object for each page
        const parsedPages = pages.map(page => ({
            ...page,
            content: typeof page.content === 'string' ? JSON.parse(page.content || '{}') : page.content
        }));

        res.json(parsedPages);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching landing pages", error: error.message });
    }
};

export const getLandingPageByParam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = await prisma.landing_pages.findFirst({
            where: {
                OR: [
                    { slug: req.params.id as string },
                    ...(isNaN(parseInt(req.params.id as string)) ? [] : [{ id: parseInt(req.params.id as string) }])
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching landing page", error: error.message });
    }
};

export const createLandingPage = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        console.log("Creating landing page with data keys:", Object.keys(data));

        const content = typeof data.content === 'object' ? JSON.stringify(data.content) : data.content;

        const page = await prisma.landing_pages.create({
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
    } catch (error: any) {
        console.error("Error creating landing page:", error);
        res.status(500).json({ status: "error", message: "Error creating landing page", error: error.message });
    }
};

export const updateLandingPage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        const content = typeof data.content === 'object' ? JSON.stringify(data.content) : data.content;

        await prisma.landing_pages.update({
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
    } catch (error: any) {
        console.error("Error updating landing page:", error);
        res.status(500).json({ status: "error", message: "Error updating landing page", error: error.message });
    }
};

export const deleteLandingPage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.landing_pages.delete({
            where: { id: parseInt(req.params.id as string) }
        });
        res.json({ status: "success", message: "Landing page deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting landing page", error: error.message });
    }
};

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (id) {
            const template = await prisma.landing_page_templates.findUnique({
                where: { id: parseInt(id) }
            });
            if (!template) {
                return res.status(404).json({ status: "error", message: "Template not found" });
            }
            return res.json(template);
        }

        const templates = await prisma.landing_page_templates.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching templates", error: error.message });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const template = await prisma.landing_page_templates.create({
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                preview_image: data.preview_image
            }
        });
        res.json({ status: "success", message: "Template created successfully", id: template.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating template", error: error.message });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        await prisma.landing_page_templates.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                preview_image: data.preview_image
            }
        });

        res.json({ status: "success", message: "Template updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating template", error: error.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.landing_page_templates.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Template deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting template", error: error.message });
    }
};
