"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTutorial = exports.updateTutorial = exports.createTutorial = exports.getTutorials = void 0;
const prisma_1 = require("../lib/prisma");
const getTutorials = async (req, res) => {
    try {
        const tutorials = await prisma_1.prisma.tutorials.findMany({
            orderBy: { created_at: 'desc' }
        });
        const formattedTutorials = tutorials.map(t => ({
            ...t,
            tags: (() => {
                try {
                    return t.tags ? JSON.parse(t.tags) : [];
                }
                catch (e) {
                    return t.tags ? t.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        }));
        res.json(formattedTutorials);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching tutorials", error: error.message });
    }
};
exports.getTutorials = getTutorials;
const createTutorial = async (req, res) => {
    try {
        const data = req.body;
        const newTutorial = await prisma_1.prisma.tutorials.create({
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
                }
                catch (e) {
                    return newTutorial.tags ? newTutorial.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        };
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating tutorial", error: error.message });
    }
};
exports.createTutorial = createTutorial;
const updateTutorial = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        if (data.tags && Array.isArray(data.tags)) {
            data.tags = JSON.stringify(data.tags);
        }
        const updated = await prisma_1.prisma.tutorials.update({
            where: { id: parseInt(id) },
            data: data
        });
        const formatted = {
            ...updated,
            tags: (() => {
                try {
                    return updated.tags ? JSON.parse(updated.tags) : [];
                }
                catch (e) {
                    return updated.tags ? updated.tags.split(',').map(s => s.trim()) : [];
                }
            })()
        };
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating tutorial", error: error.message });
    }
};
exports.updateTutorial = updateTutorial;
const deleteTutorial = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.tutorials.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Tutorial deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting tutorial", error: error.message });
    }
};
exports.deleteTutorial = deleteTutorial;
