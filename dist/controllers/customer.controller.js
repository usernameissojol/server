"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteCustomers = exports.getCustomerStats = exports.getCustomers = void 0;
const prisma_1 = require("../lib/prisma");
const getCustomers = async (req, res) => {
    try {
        const customers = await prisma_1.prisma.users.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching customers", error: error.message });
    }
};
exports.getCustomers = getCustomers;
const getCustomerStats = async (req, res) => {
    try {
        const total = await prisma_1.prisma.users.count();
        const active = await prisma_1.prisma.users.count({ where: { status: 'Active' } });
        res.json({
            total,
            active,
            new_today: 0,
            blocked: 0
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching customer stats", error: error.message });
    }
};
exports.getCustomerStats = getCustomerStats;
const bulkDeleteCustomers = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        }
        await prisma_1.prisma.users.deleteMany({
            where: { id: { in: ids } }
        });
        res.json({ status: "success", message: "Customers deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting customers", error: error.message });
    }
};
exports.bulkDeleteCustomers = bulkDeleteCustomers;
