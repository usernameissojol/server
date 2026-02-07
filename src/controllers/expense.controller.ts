import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// Get All Expenses
export const getExpenses = async (req: Request, res: Response) => {
    try {
        const expenses = await prisma.expenses.findMany({
            orderBy: { date: 'desc' }
        });
        res.json({
            status: "success",
            data: expenses
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching expenses", error: error.message });
    }
};

// Create Expense
export const createExpense = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newExpense = await prisma.expenses.create({
            data: {
                category: data.category,
                amount: new Prisma.Decimal(data.amount),
                description: data.description,
                date: new Date(data.date),
                created_by: data.created_by // Optional: handle referencing logged in admin
            }
        });
        res.json({
            status: "success",
            data: newExpense
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating expense", error: error.message });
    }
};

// Update Expense
export const updateExpense = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const updated = await prisma.expenses.update({
            where: { id: parseInt(id) },
            data: {
                category: data.category,
                amount: new Prisma.Decimal(data.amount),
                description: data.description,
                date: new Date(data.date),
            }
        });
        res.json({
            status: "success",
            data: updated
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating expense", error: error.message });
    }
};

// Delete Expense
export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.expenses.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Expense deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting expense", error: error.message });
    }
};

// Get Expense Stats
export const getExpenseStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

        const totalExpenses = await prisma.expenses.aggregate({
            _sum: { amount: true }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = await prisma.expenses.aggregate({
            _sum: { amount: true },
            where: { date: { gte: thirtyDaysAgo } }
        });

        // Calculate Trend (Current Month vs Last Month)
        const currentMonthSum = await prisma.expenses.aggregate({
            _sum: { amount: true },
            where: { date: { gte: startOfCurrentMonth } }
        });

        const lastMonthSum = await prisma.expenses.aggregate({
            _sum: { amount: true },
            where: {
                date: {
                    gte: startOfLastMonth,
                    lt: startOfCurrentMonth
                }
            }
        });

        const currentVal = currentMonthSum._sum.amount?.toNumber() || 0;
        const lastVal = lastMonthSum._sum.amount?.toNumber() || 0;

        let trend = 0;
        if (lastVal > 0) {
            trend = Math.round(((currentVal - lastVal) / lastVal) * 100);
        } else if (currentVal > 0) {
            trend = 100;
        }

        // Group by category
        const byCategory = await prisma.expenses.groupBy({
            by: ['category'],
            _sum: { amount: true }
        });

        const total = totalExpenses._sum.amount?.toNumber() || 0;

        const breakdown = byCategory.map(c => ({
            name: c.category,
            value: c._sum.amount?.toNumber() || 0,
            percent: total > 0 ? Math.round(((c._sum.amount?.toNumber() || 0) / total) * 100) : 0
        }));

        // Monthly data (last 6 months) including zeros
        const monthly_data = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });

            const monthSum = await prisma.expenses.aggregate({
                _sum: { amount: true },
                where: {
                    date: {
                        gte: d,
                        lt: nextD
                    }
                }
            });

            monthly_data.push({
                month: label,
                fullMonth: d.toISOString().slice(0, 7),
                total: monthSum._sum.amount?.toNumber() || 0
            });
        }

        res.json({
            status: "success",
            data: {
                total_expenses: total,
                last_30_days: recentExpenses._sum.amount?.toNumber() || 0,
                trend,
                breakdown,
                monthly_data
            }
        });

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching expense stats", error: error.message });
    }
};
