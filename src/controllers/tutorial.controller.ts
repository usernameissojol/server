import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getTutorials = async (req: Request, res: Response) => {
    try {
        const tutorials = await prisma.tutorials.findMany({
            orderBy: { created_at: 'desc' }
        });

        const formattedTutorials = tutorials.map(t => ({
            ...t,
            tags: (() => {
                try {
                    return t.tags ? JSON.parse(t.tags) : [];
                } catch (e) {
                    return t.tags ? t.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        }));

        res.json(formattedTutorials);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching tutorials", error: error.message });
    }
};

export const createTutorial = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newTutorial = await prisma.tutorials.create({
            data: {
                title: data.title,
                video_url: data.video_url,
                thumbnail: data.thumbnail,
                tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags,
                status: data.status || 'active'
            }
        });
        const formatted = {
            ...newTutorial,
            tags: (() => {
                try {
                    return newTutorial.tags ? JSON.parse(newTutorial.tags) : [];
                } catch (e) {
                    return newTutorial.tags ? newTutorial.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        };
        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating tutorial", error: error.message });
    }
};

export const updateTutorial = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        if (data.tags && Array.isArray(data.tags)) {
            data.tags = JSON.stringify(data.tags);
        }

        const updated = await prisma.tutorials.update({
            where: { id: parseInt(id) },
            data: data
        });
        const formatted = {
            ...updated,
            tags: (() => {
                try {
                    return updated.tags ? JSON.parse(updated.tags) : [];
                } catch (e) {
                    return updated.tags ? updated.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        };
        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating tutorial", error: error.message });
    }
};

export const deleteTutorial = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.tutorials.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Tutorial deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting tutorial", error: error.message });
    }
};
