"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearActivityLogs = exports.getActivityLogs = void 0;
const prisma_1 = require("../lib/prisma");
const getActivityLogs = async (req, res) => {
    try {
        const { type, search } = req.query;
        const where = {};
        if (type && type !== "undefined") {
            where.type = type;
        }
        if (search) {
            where.OR = [
                { user_name: { contains: search } },
                { action: { contains: search } },
                { target: { contains: search } }
            ];
        }
        const logs = await prisma_1.prisma.activity_logs.findMany({
            where,
            orderBy: { created_at: "desc" },
            take: 100 // Limit to last 100 for performance
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching activity logs", error: error.message });
    }
};
exports.getActivityLogs = getActivityLogs;
const clearActivityLogs = async (req, res) => {
    try {
        await prisma_1.prisma.activity_logs.deleteMany({});
        res.json({ status: "success", message: "Activity logs cleared" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error clearing activity logs", error: error.message });
    }
};
exports.clearActivityLogs = clearActivityLogs;
