import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await prisma.tags.findMany();
        res.json(tags);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching tags", error: error.message });
    }
};

export const getAttributes = async (req: Request, res: Response) => {
    try {
        const attributes = await prisma.attributes.findMany();
        const parsed = attributes.map(attr => {
            let values = [];
            try {
                if (attr.values) {
                    values = JSON.parse(attr.values);
                }
            } catch (e) {
                // If parse fails, handle as fallback (e.g. if it was a simple string)
                values = attr.values ? [attr.values] : [];
            }
            return {
                ...attr,
                values: Array.isArray(values) ? values : []
            };
        });
        res.json(parsed);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching attributes", error: error.message });
    }
};
export const createTag = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const tag = await prisma.tags.create({
            data: {
                name: data.name,
                slug: data.slug,
                color: data.color,
                status: data.status || 'publish'
            }
        });
        res.json({ status: "success", message: "Tag created successfully", id: tag.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating tag", error: error.message });
    }
};

export const updateTag = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;
        await prisma.tags.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                color: data.color,
                status: data.status
            }
        });
        res.json({ status: "success", message: "Tag updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating tag", error: error.message });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.tags.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Tag deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting tag", error: error.message });
    }
};

export const bulkDeleteTags = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        await prisma.tags.deleteMany({
            where: { id: { in: ids.map((id: any) => parseInt(id)) } }
        });
        res.json({ status: "success", message: "Tags deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};

// Attributes
export const createAttribute = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const attribute = await prisma.attributes.create({
            data: {
                name: data.name,
                slug: data.slug,
                type: data.type || 'Dropdown',
                values: typeof data.values === 'string' ? data.values : JSON.stringify(data.values),
                status: data.status || 'publish',
                icon: data.icon
            }
        });
        res.json({ status: "success", message: "Attribute created successfully", id: attribute.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating attribute", error: error.message });
    }
};

export const updateAttribute = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;
        await prisma.attributes.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                type: data.type,
                values: typeof data.values === 'string' ? data.values : JSON.stringify(data.values),
                status: data.status,
                icon: data.icon
            }
        });
        res.json({ status: "success", message: "Attribute updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating attribute", error: error.message });
    }
};

export const deleteAttribute = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.attributes.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Attribute deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting attribute", error: error.message });
    }
};

export const bulkDeleteAttributes = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        await prisma.attributes.deleteMany({
            where: { id: { in: ids.map((id: any) => parseInt(id)) } }
        });
        res.json({ status: "success", message: "Attributes deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
