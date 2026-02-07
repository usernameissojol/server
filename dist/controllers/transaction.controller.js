"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.createTransaction = exports.getTransactionById = exports.getTransactions = void 0;
const prisma_1 = require("../lib/prisma");
const getTransactions = async (req, res) => {
    try {
        const { search, type, status } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { transaction_id: { contains: search } },
                { payer_name: { contains: search } }
            ];
        }
        const transactions = await prisma_1.prisma.transactions.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching transactions", error: error.message });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const transaction = await prisma_1.prisma.transactions.findUnique({
            where: { id }
        });
        if (!transaction)
            return res.status(404).json({ status: "error", message: "Transaction not found" });
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching transaction", error: error.message });
    }
};
exports.getTransactionById = getTransactionById;
const createTransaction = async (req, res) => {
    try {
        const data = req.body;
        const newTransaction = await prisma_1.prisma.transactions.create({
            data: {
                transaction_id: data.transaction_id || `TRX-${Date.now()}`,
                order_id: data.order_id ? parseInt(data.order_id) : null,
                user_id: data.user_id ? parseInt(data.user_id) : null,
                payer_name: data.payer_name,
                amount: parseFloat(data.amount),
                type: data.type,
                method: data.method,
                status: data.status,
                note: data.note
            }
        });
        res.json({ status: "success", message: "Transaction created", id: newTransaction.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating transaction", error: error.message });
    }
};
exports.createTransaction = createTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.transactions.delete({ where: { id } });
        res.json({ status: "success", message: "Transaction deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting transaction", error: error.message });
    }
};
exports.deleteTransaction = deleteTransaction;
