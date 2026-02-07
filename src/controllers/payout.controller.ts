import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Payout Methods
export const getPayoutMethods = async (req: Request, res: Response) => {
    try {
        const methods = await prisma.payout_methods.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(methods);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching payout methods", error: error.message });
    }
};

export const createPayoutMethod = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const method = await prisma.payout_methods.create({
            data: {
                type: data.type,
                name: data.name,
                account_number: data.account_number,
                account_holder: data.account_holder,
                details: data.details,
                is_default: data.is_default || false,
                status: data.status !== undefined ? data.status : true
            }
        });
        res.json({ status: "success", message: "Payout method created", id: method.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating payout method", error: error.message });
    }
};

export const deletePayoutMethod = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.payout_methods.delete({ where: { id } });
        res.json({ status: "success", message: "Payout method deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting payout method", error: error.message });
    }
};

// Payouts
export const getPayouts = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) where.status = status as string;

        const payouts = await prisma.payouts.findMany({
            where,
            orderBy: { requested_at: 'desc' }
        });
        res.json(payouts);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching payouts", error: error.message });
    }
};

export const createPayout = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const payout = await prisma.payouts.create({
            data: {
                method_id: data.method_id ? parseInt(data.method_id) : null,
                amount: parseFloat(data.amount),
                status: 'pending',
                notes: data.notes
            }
        });
        res.json({ status: "success", message: "Payout requested", id: payout.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error requesting payout", error: error.message });
    }
};

export const updatePayoutStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status, reference_id } = req.body;

        const data: any = { status };
        if (status === 'completed') data.processed_at = new Date();
        if (reference_id) data.reference_id = reference_id;

        await prisma.payouts.update({
            where: { id },
            data
        });
        res.json({ status: "success", message: "Payout status updated" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating payout status", error: error.message });
    }
};

export const getPayoutStats = async (req: Request, res: Response) => {
    try {
        const totalWithdrawn = await prisma.payouts.aggregate({
            where: { status: 'completed' },
            _sum: { amount: true }
        });
        const pendingWithdrawals = await prisma.payouts.aggregate({
            where: { status: 'pending' },
            _sum: { amount: true }
        });

        // Calculate available balance (Revenue - Withdrawals - Expenses) ??? 
        // For now, just simplistic or placeholders. 
        // Real implementation depends on where total revenue is tracked.
        // Assuming we calculate from revenue table minus expenses/payouts.

        const totalRevenue = await prisma.revenue.aggregate({
            _sum: { amount: true },
            where: { status: 'received' } // Assuming 'received' status for revenue
        });

        const availableBalance = (totalRevenue._sum.amount?.toNumber() || 0) - (totalWithdrawn._sum.amount?.toNumber() || 0);

        res.json({
            total_withdrawn: totalWithdrawn._sum.amount || 0,
            pending_withdrawals: pendingWithdrawals._sum.amount || 0,
            available_balance: availableBalance
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching payout stats", error: error.message });
    }
};
