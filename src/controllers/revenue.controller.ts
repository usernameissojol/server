import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format, eachMonthOfInterval } from "date-fns";

// ============================================
// REVENUE
// ============================================

export const getAllRevenues = async (req: Request, res: Response) => {
    try {
        const { category_id, status, start_date, end_date } = req.query;

        const where: any = {};
        if (category_id) where.category_id = parseInt(category_id as string);
        if (status) where.status = status as string;
        if (start_date || end_date) {
            where.date = {};
            if (start_date) where.date.gte = new Date(start_date as string);
            if (end_date) where.date.lte = new Date(end_date as string);
        }

        const revenues = await prisma.revenue.findMany({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching revenues", error: error.message });
    }
};

export const createRevenue = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const revenue = await prisma.revenue.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating revenue", error: error.message });
    }
};

export const updateRevenue = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;
        await prisma.revenue.update({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating revenue", error: error.message });
    }
};

export const deleteRevenue = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.revenue.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Revenue entry deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting revenue", error: error.message });
    }
};

export const getRevenueStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Revenue (all time completed orders + received manual revenue)
        const orderSummary = await prisma.orders.aggregate({
            _sum: { total: true },
            where: { status: 'Delivered' } // Assuming 'Delivered' is the final successful state
        });

        const manualRevenueSummary = await prisma.revenue.aggregate({
            _sum: { amount: true },
            where: { status: 'received' }
        });

        const orderRevenue = Number(orderSummary._sum.total || 0);
        const otherRevenue = Number(manualRevenueSummary._sum.amount || 0);
        const totalRevenue = orderRevenue + otherRevenue;

        // 2. Monthly Data (Last 6 months)
        const today = new Date();
        const sixMonthsAgo = startOfMonth(subMonths(today, 5));

        const monthlyInterval = eachMonthOfInterval({
            start: sixMonthsAgo,
            end: today
        });

        const monthlyData = await Promise.all(monthlyInterval.map(async (monthStart: Date) => {
            const monthEnd = endOfMonth(monthStart);

            const mOrderSum = await prisma.orders.aggregate({
                _sum: { total: true },
                where: {
                    status: 'Delivered',
                    created_at: { gte: monthStart, lte: monthEnd }
                }
            });

            const mManualSum = await prisma.revenue.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'received',
                    date: { gte: monthStart, lte: monthEnd }
                }
            });

            return {
                month: format(monthStart, "MMM"),
                total: Number(mOrderSum._sum.total || 0) + Number(mManualSum._sum.amount || 0)
            };
        }));

        // 3. Breakdown by category
        const categories = await prisma.income_categories.findMany();
        const breakdown = await Promise.all(categories.map(async (cat) => {
            const sum = await prisma.revenue.aggregate({
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

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching revenue stats", error: error.message });
    }
};

// ============================================
// INCOME CATEGORIES
// ============================================

export const getIncomeCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.income_categories.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching categories", error: error.message });
    }
};

export const createIncomeCategory = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const category = await prisma.income_categories.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status === undefined ? true : Boolean(data.status)
            }
        });
        res.json({ status: "success", message: "Category created", id: category.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating category", error: error.message });
    }
};

export const updateIncomeCategory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const data = req.body;
        await prisma.income_categories.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                status: data.status === undefined ? undefined : Boolean(data.status),
                updated_at: new Date()
            }
        });
        res.json({ status: "success", message: "Category updated" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating category", error: error.message });
    }
};

export const deleteIncomeCategory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        // Instead of blocking, we'll nullify the category_id in existing revenue records
        // then delete the category. This is safer than a blind delete if the DB doesn't have CASCADE NULL.
        await prisma.$transaction([
            prisma.revenue.updateMany({
                where: { category_id: id },
                data: { category_id: null }
            }),
            prisma.income_categories.delete({
                where: { id }
            })
        ]);

        res.json({ status: "success", message: "Category deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting category", error: error.message });
    }
};
