import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Get All Locations
export const getDeliveryLocations = async (req: Request, res: Response) => {
    try {
        const locations = await prisma.delivery_locations.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(locations);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching delivery locations", error: error.message });
    }
};

// Create Location
export const createDeliveryLocation = async (req: Request, res: Response) => {
    try {
        const { name, regular_charge, express_charge, is_active } = req.body;

        const exists = await prisma.delivery_locations.findUnique({
            where: { name }
        });

        if (exists) {
            return res.status(400).json({ status: "error", message: "Location already exists" });
        }

        const location = await prisma.delivery_locations.create({
            data: {
                name,
                regular_charge: regular_charge ? Number(regular_charge) : 0,
                express_charge: express_charge ? Number(express_charge) : 0,
                is_active: is_active !== undefined ? is_active : true
            }
        });

        res.json({ status: "success", message: "Location created successfully", location });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating location", error: error.message });
    }
};

// Update Location
export const updateDeliveryLocation = async (req: Request, res: Response) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(idParam as string);
        const { name, regular_charge, express_charge, is_active } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        }

        const updateData: any = { updated_at: new Date() };

        if (name !== undefined) updateData.name = name;
        if (regular_charge !== undefined) updateData.regular_charge = Number(regular_charge);
        if (express_charge !== undefined) updateData.express_charge = Number(express_charge);
        if (is_active !== undefined) updateData.is_active = is_active;

        await prisma.delivery_locations.update({
            where: { id },
            data: updateData
        });

        res.json({ status: "success", message: "Location updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating location", error: error.message });
    }
};

// Delete Location
export const deleteDeliveryLocation = async (req: Request, res: Response) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(idParam as string);

        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        }

        await prisma.delivery_locations.delete({
            where: { id }
        });

        res.json({ status: "success", message: "Location deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting location", error: error.message });
    }
};
