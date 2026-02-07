import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getPages = async (req: Request, res: Response) => {
    try {
        const pages = await prisma.pages.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(pages);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching pages", error: error.message });
    }
};

export const getPageBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const page = await prisma.pages.findFirst({
            where: {
                OR: [
                    { slug: req.params.slug as string },
                    ...(isNaN(parseInt(req.params.slug as string)) ? [] : [{ id: parseInt(req.params.slug as string) }])
                ]
            }
        });
        if (!page) return res.status(404).json({ status: "error", message: "Page not found" });
        res.json(page);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching page", error: error.message });
    }
};

export const createPage = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const page = await prisma.pages.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                type: data.type || 'Custom',
                status: data.status || 'published'
            }
        });
        res.json({ status: "success", message: "Page created successfully", id: page.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating page", error: error.message });
    }
};

export const updatePage = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;

        await prisma.pages.update({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating page", error: error.message });
    }
};

export const deletePage = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.pages.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Page deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting page", error: error.message });
    }
};
