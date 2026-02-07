"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayoutStats = exports.updatePayoutStatus = exports.createPayout = exports.getPayouts = exports.deletePayoutMethod = exports.createPayoutMethod = exports.getPayoutMethods = void 0;
const prisma_1 = require("../lib/prisma");
// Payout Methods
const getPayoutMethods = async (req, res) => {
    try {
        const methods = await prisma_1.prisma.payout_methods.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(methods);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching payout methods", error: error.message });
    }
};
exports.getPayoutMethods = getPayoutMethods;
const createPayoutMethod = async (req, res) => {
    try {
        const data = req.body;
        const method = await prisma_1.prisma.payout_methods.create({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating payout method", error: error.message });
    }
};
exports.createPayoutMethod = createPayoutMethod;
const deletePayoutMethod = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.payout_methods.delete({ where: { id } });
        res.json({ status: "success", message: "Payout method deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting payout method", error: error.message });
    }
};
exports.deletePayoutMethod = deletePayoutMethod;
// Payouts
const getPayouts = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status)
            where.status = status;
        const payouts = await prisma_1.prisma.payouts.findMany({
            where,
            orderBy: { requested_at: 'desc' }
        });
        res.json(payouts);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching payouts", error: error.message });
    }
};
exports.getPayouts = getPayouts;
const createPayout = async (req, res) => {
    try {
        const data = req.body;
        const payout = await prisma_1.prisma.payouts.create({
            data: {
                method_id: data.method_id ? parseInt(data.method_id) : null,
                amount: parseFloat(data.amount),
                status: 'pending',
                notes: data.notes
            }
        });
        res.json({ status: "success", message: "Payout requested", id: payout.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error requesting payout", error: error.message });
    }
};
exports.createPayout = createPayout;
const updatePayoutStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, reference_id } = req.body;
        const data = { status };
        if (status === 'completed')
            data.processed_at = new Date();
        if (reference_id)
            data.reference_id = reference_id;
        await prisma_1.prisma.payouts.update({
            where: { id },
            data
        });
        res.json({ status: "success", message: "Payout status updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating payout status", error: error.message });
    }
};
exports.updatePayoutStatus = updatePayoutStatus;
const getPayoutStats = async (req, res) => {
    try {
        const totalWithdrawn = await prisma_1.prisma.payouts.aggregate({
            where: { status: 'completed' },
            _sum: { amount: true }
        });
        const pendingWithdrawals = await prisma_1.prisma.payouts.aggregate({
            where: { status: 'pending' },
            _sum: { amount: true }
        });
        // Calculate available balance (Revenue - Withdrawals - Expenses) ??? 
        // For now, just simplistic or placeholders. 
        // Real implementation depends on where total revenue is tracked.
        // Assuming we calculate from revenue table minus expenses/payouts.
        const totalRevenue = await prisma_1.prisma.revenue.aggregate({
            _sum: { amount: true },
            where: { status: 'received' } // Assuming 'received' status for revenue
        });
        const availableBalance = (totalRevenue._sum.amount?.toNumber() || 0) - (totalWithdrawn._sum.amount?.toNumber() || 0);
        res.json({
            total_withdrawn: totalWithdrawn._sum.amount || 0,
            pending_withdrawals: pendingWithdrawals._sum.amount || 0,
            available_balance: availableBalance
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching payout stats", error: error.message });
    }
};
exports.getPayoutStats = getPayoutStats;
