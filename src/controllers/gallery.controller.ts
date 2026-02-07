import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getGalleryItems = async (req: Request, res: Response) => {
    try {
        const items = await prisma.gallery.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching gallery", error: error.message });
    }
};

export const uploadGalleryItem = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ status: "error", message: "No files uploaded" });
        }

        const savedItems = [];
        for (const file of files) {
            const item = await prisma.gallery.create({
                data: {
                    image: `uploads/gallery/${file.filename}`,
                    title: file.originalname,
                    category: 'General'
                }
            });
            savedItems.push(item);
        }

        res.json({ status: "success", message: "Images uploaded successfully", images: savedItems });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error uploading images", error: error.message });
    }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.gallery.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Item deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting item", error: error.message });
    }
};

export const bulkDeleteGalleryItems = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        }

        await prisma.gallery.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ status: "success", message: "Items deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting items", error: error.message });
    }
};
