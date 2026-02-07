"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIncomeCategory = exports.updateIncomeCategory = exports.createIncomeCategory = exports.getIncomeCategories = exports.getRevenueStats = exports.deleteRevenue = exports.updateRevenue = exports.createRevenue = exports.getAllRevenues = void 0;
const prisma_1 = require("../lib/prisma");
const date_fns_1 = require("date-fns");
// ============================================
// REVENUE
// ============================================
const getAllRevenues = async (req, res) => {
    try {
        const { category_id, status, start_date, end_date } = req.query;
        const where = {};
        if (category_id)
            where.category_id = parseInt(category_id);
        if (status)
            where.status = status;
        if (start_date || end_date) {
            where.date = {};
            if (start_date)
                where.date.gte = new Date(start_date);
            if (end_date)
                where.date.lte = new Date(end_date);
        }
        const revenues = await prisma_1.prisma.revenue.findMany({
            where,
            include: {
                income_categories: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        // Map to include category name for frontend
        const mappedRevenues = revenues.map(r => ({
            ...r,
            category_name: r.income_categories?.name || 'Uncategorized'
        }));
        res.json(mappedRevenues);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching revenues", error: error.message });
    }
};
exports.getAllRevenues = getAllRevenues;
const createRevenue = async (req, res) => {
    try {
        const data = req.body;
        const revenue = await prisma_1.prisma.revenue.create({
            data: {
                amount: data.amount,
                category_id: data.category_id ? parseInt(data.category_id) : null,
                source: data.source,
                date: new Date(data.date),
                status: data.status || 'received',
                notes: data.notes
            }
        });
        res.json({ status: "success", message: "Revenue entry created", id: revenue.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating revenue", error: error.message });
    }
};
exports.createRevenue = createRevenue;
const updateRevenue = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.revenue.update({
            where: { id },
            data: {
                amount: data.amount,
                category_id: data.category_id ? parseInt(data.category_id) : undefined,
                source: data.source,
                date: data.date ? new Date(data.date) : undefined,
                status: data.status,
                notes: data.notes,
                updated_at: new Date()
            }
        });
        res.json({ status: "success", message: "Revenue entry updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating revenue", error: error.message });
    }
};
exports.updateRevenue = updateRevenue;
const deleteRevenue = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.revenue.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Revenue entry deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting revenue", error: error.message });
    }
};
exports.deleteRevenue = deleteRevenue;
const getRevenueStats = async (req, res) => {
    try {
        // 1. Total Revenue (all time completed orders + received manual revenue)
        const orderSummary = await prisma_1.prisma.orders.aggregate({
            _sum: { total: true },
            where: { status: 'Delivered' } // Assuming 'Delivered' is the final successful state
        });
        const manualRevenueSummary = await prisma_1.prisma.revenue.aggregate({
            _sum: { amount: true },
            where: { status: 'received' }
        });
        const orderRevenue = Number(orderSummary._sum.total || 0);
        const otherRevenue = Number(manualRevenueSummary._sum.amount || 0);
        const totalRevenue = orderRevenue + otherRevenue;
        // 2. Monthly Data (Last 6 months)
        const today = new Date();
        const sixMonthsAgo = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(today, 5));
        const monthlyInterval = (0, date_fns_1.eachMonthOfInterval)({
            start: sixMonthsAgo,
            end: today
        });
        const monthlyData = await Promise.all(monthlyInterval.map(async (monthStart) => {
            const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
            const mOrderSum = await prisma_1.prisma.orders.aggregate({
                _sum: { total: true },
                where: {
                    status: 'Delivered',
                    created_at: { gte: monthStart, lte: monthEnd }
                }
            });
            const mManualSum = await prisma_1.prisma.revenue.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'received',
                    date: { gte: monthStart, lte: monthEnd }
                }
            });
            return {
                month: (0, date_fns_1.format)(monthStart, "MMM"),
                total: Number(mOrderSum._sum.total || 0) + Number(mManualSum._sum.amount || 0)
            };
        }));
        // 3. Breakdown by category
        const categories = await prisma_1.prisma.income_categories.findMany();
        const breakdown = await Promise.all(categories.map(async (cat) => {
            const sum = await prisma_1.prisma.revenue.aggregate({
                _sum: { amount: true },
                where: { category_id: cat.id, status: 'received' }
            });
            return {
                name: cat.name,
                value: Number(sum._sum.amount || 0)
            };
        }));
        // Add 'Orders' as a category in breakdown
        breakdown.unshift({
            name: 'Orders',
            value: orderRevenue
        });
        res.json({
            total_revenue: totalRevenue,
            order_revenue: orderRevenue,
            other_revenue: otherRevenue,
            monthly_data: monthlyData,
            breakdown: breakdown.filter(b => b.value > 0)
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching revenue stats", error: error.message });
    }
};
exports.getRevenueStats = getRevenueStats;
// ============================================
// INCOME CATEGORIES
// ============================================
const getIncomeCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.income_categories.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching categories", error: error.message });
    }
};
exports.getIncomeCategories = getIncomeCategories;
const createIncomeCategory = async (req, res) => {
    try {
        const data = req.body;
        const category = await prisma_1.prisma.income_categories.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status === undefined ? true : Boolean(data.status)
            }
        });
        res.json({ status: "success", message: "Category created", id: category.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating category", error: error.message });
    }
};
exports.createIncomeCategory = createIncomeCategory;
const updateIncomeCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.income_categories.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                status: data.status === undefined ? undefined : Boolean(data.status),
                updated_at: new Date()
            }
        });
        res.json({ status: "success", message: "Category updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating category", error: error.message });
    }
};
exports.updateIncomeCategory = updateIncomeCategory;
const deleteIncomeCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Instead of blocking, we'll nullify the category_id in existing revenue records
        // then delete the category. This is safer than a blind delete if the DB doesn't have CASCADE NULL.
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.revenue.updateMany({
                where: { category_id: id },
                data: { category_id: null }
            }),
            prisma_1.prisma.income_categories.delete({
                where: { id }
            })
        ]);
        res.json({ status: "success", message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting category", error: error.message });
    }
};
exports.deleteIncomeCategory = deleteIncomeCategory;
