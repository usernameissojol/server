import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getPopups = async (req: Request, res: Response) => {
    try {
        const popups = await prisma.popups.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(popups);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching popups", error: error.message });
    }
};

export const createPopup = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        let imagePath = data.image;

        // Handle file upload
        if (req.file) {
            imagePath = `uploads/popups/${req.file.filename}`;
        }
        // Handle gallery image selection
        else if (data.image_path) {
            imagePath = data.image_path;
        }

        const popup = await prisma.popups.create({
            data: {
                title: data.title,
                content: data.content,
                image: imagePath || null,
                button_text: data.button_text,
                button_link: data.button_link,
                delay: parseInt(data.delay) || 3000, // Default 3000ms
                frequency: data.frequency || 'session',
                status: data.status || 'active'
            }
        });

        res.status(201).json({ status: "success", message: "Popup created successfully", id: popup.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating popup", error: error.message });
    }
};

export const updatePopup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updateData: any = {
            title: data.title,
            content: data.content,
            button_text: data.button_text,
            button_link: data.button_link,
            delay: data.delay ? parseInt(data.delay) : undefined,
            frequency: data.frequency,
            status: data.status
        };

        // Only update image if a new one is provided
        if (req.file) {
            updateData.image = `uploads/popups/${req.file.filename}`;
        } else if (data.image_path) {
            updateData.image = data.image_path;
        }

        await prisma.popups.update({
            where: { id: parseInt(id as string) },
            data: updateData
        });

        res.json({ status: "success", message: "Popup updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating popup", error: error.message });
    }
};

export const deletePopup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.popups.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Popup deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting popup", error: error.message });
    }
};
