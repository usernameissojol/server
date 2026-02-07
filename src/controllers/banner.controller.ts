import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// For admin panel - get all banners regardless of status
export const getAllBannersAdmin = async (req: Request, res: Response) => {
    try {
        const banners = await prisma.banners.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching banners", error: error.message });
    }
};

// For frontend - get only active banners
export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await prisma.banners.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching banners", error: error.message });
    }
};

export const createBanner = async (req: Request, res: Response) => {
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

        const banner = await prisma.banners.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating banner", error: error.message });
    }
};

export const updateBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updateData: any = {
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
        } else if (data.image_path) {
            updateData.image = data.image_path;
        }

        await prisma.banners.update({
            where: { id: parseInt(id as string) },
            data: updateData
        });

        res.json({ status: "success", message: "Banner updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating banner", error: error.message });
    }
};

export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.banners.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Banner deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting banner", error: error.message });
    }
};
