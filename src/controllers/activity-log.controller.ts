import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        const { type, search } = req.query;

        const where: any = {};
        if (type && type !== "undefined") {
            where.type = type as string;
        }

        if (search) {
            where.OR = [
                { user_name: { contains: search as string } },
                { action: { contains: search as string } },
                { target: { contains: search as string } }
            ];
        }

        const logs = await prisma.activity_logs.findMany({
            where,
            orderBy: { created_at: "desc" },
            take: 100 // Limit to last 100 for performance
        });

        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching activity logs", error: error.message });
    }
};

export const clearActivityLogs = async (req: Request, res: Response) => {
    try {
        await prisma.activity_logs.deleteMany({});
        res.json({ status: "success", message: "Activity logs cleared" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error clearing activity logs", error: error.message });
    }
};
