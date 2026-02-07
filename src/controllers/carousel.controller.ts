import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// For admin panel - get all carousels regardless of status
export const getAllCarouselsAdmin = async (req: Request, res: Response) => {
    try {
        const carousels = await prisma.carousels.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching carousels", error: error.message });
    }
};

// For frontend - get only active carousels
export const getCarousels = async (req: Request, res: Response) => {
    try {
        const carousels = await prisma.carousels.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(carousels);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching carousels", error: error.message });
    }
};

export const createCarousel = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        let imagePath = data.image;

        // Handle file upload
        if (req.file) {
            imagePath = `uploads/carousels/${req.file.filename}`;
        }
        // Handle gallery image selection
        else if (data.image_path) {
            imagePath = data.image_path;
        }

        const carousel = await prisma.carousels.create({
            data: {
                title: data.title || '',
                description: data.description,
                image: imagePath || '',
                link: data.link,
                button_text: data.button_text,
                order: parseInt(data.order) || 0,
                status: data.status || 'active'
            }
        });

        res.status(201).json({ status: "success", message: "Carousel created successfully", id: carousel.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating carousel", error: error.message });
    }
};

export const updateCarousel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updateData: any = {
            title: data.title !== undefined ? data.title : undefined,
            description: data.description,
            link: data.link,
            button_text: data.button_text,
            order: data.order ? parseInt(data.order) : undefined,
            status: data.status
        };

        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = `uploads/carousels/${req.file.filename}`;
        } else if (data.image_path) {
            updateData.image = data.image_path;
        }

        await prisma.carousels.update({
            where: { id: parseInt(id as string) },
            data: updateData
        });

        res.json({ status: "success", message: "Carousel updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating carousel", error: error.message });
    }
};

export const deleteCarousel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.carousels.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Carousel deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting carousel", error: error.message });
    }
};
