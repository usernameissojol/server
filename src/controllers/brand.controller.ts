import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getBrands = async (req: Request, res: Response) => {
    try {
        const brands = await prisma.brands.findMany();
        res.json(brands);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching brands", error: error.message });
    }
};
export const createBrand = async (req: Request, res: Response) => {
    try {
        const { name, image_path } = req.body;
        // Remove leading slash if it exists in the path
        const logo = req.file ? `uploads/brands/${req.file.filename}` : (image_path || null);

        const brand = await prisma.brands.create({
            data: { name, logo: logo ? logo.replace(/^\//, '') : null }
        });

        res.json({ status: "success", message: "Brand created successfully", id: brand.id });
    } catch (error: any) {
        console.error("Error creating brand:", error);
        res.status(500).json({ status: "error", message: "Error creating brand", error: error.message });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { name, image_path } = req.body;

        const data: any = { name };
        if (req.file) {
            data.logo = `uploads/brands/${req.file.filename}`;
        } else if (image_path) {
            data.logo = image_path.replace(/^\//, '');
        }

        await prisma.brands.update({
            where: { id },
            data
        });

        res.json({ status: "success", message: "Brand updated successfully" });
    } catch (error: any) {
        console.error("Error updating brand:", error);
        res.status(500).json({ status: "error", message: "Error updating brand", error: error.message });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.brands.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Brand deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting brand", error: error.message });
    }
};

export const bulkDeleteBrands = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs format" });
        }

        await prisma.brands.deleteMany({
            where: {
                id: { in: ids.map((id: any) => parseInt(id)) }
            }
        });

        res.json({ status: "success", message: "Brands deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
