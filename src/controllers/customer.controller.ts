import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.users.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(customers);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching customers", error: error.message });
    }
};

export const getCustomerStats = async (req: Request, res: Response) => {
    try {
        const total = await prisma.users.count();
        const active = await prisma.users.count({ where: { status: 'Active' } });

        res.json({
            total,
            active,
            new_today: 0,
            blocked: 0
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching customer stats", error: error.message });
    }
};

export const bulkDeleteCustomers = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        }

        await prisma.users.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ status: "success", message: "Customers deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting customers", error: error.message });
    }
};
