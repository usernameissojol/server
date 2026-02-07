import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getFooterLinks = async (req: Request, res: Response) => {
    try {
        const links = await prisma.footer_links.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(links);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching footer links", error: error.message });
    }
};

export const createFooterLink = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const link = await prisma.footer_links.create({
            data: {
                section: data.section,
                title: data.title,
                url: data.url,
                order: parseInt(data.order) || 0,
                status: data.status || 'active'
            }
        });
        res.status(201).json({ status: "success", message: "Link created", id: link.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating link", error: error.message });
    }
};

export const updateFooterLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await prisma.footer_links.update({
            where: { id: parseInt(id as string) },
            data: {
                section: data.section,
                title: data.title,
                url: data.url,
                order: data.order !== undefined ? parseInt(data.order) : undefined,
                status: data.status
            }
        });
        res.json({ status: "success", message: "Link updated" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating link", error: error.message });
    }
};

export const deleteFooterLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.footer_links.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Link deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting link", error: error.message });
    }
};
