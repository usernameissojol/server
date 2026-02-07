import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { search, type, status } = req.query;
        const where: any = {};

        if (type) where.type = type as string;
        if (status) where.status = status as string;
        if (search) {
            where.OR = [
                { transaction_id: { contains: search as string } },
                { payer_name: { contains: search as string } }
            ];
        }

        const transactions = await prisma.transactions.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching transactions", error: error.message });
    }
};

export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const transaction = await prisma.transactions.findUnique({
            where: { id }
        });
        if (!transaction) return res.status(404).json({ status: "error", message: "Transaction not found" });
        res.json(transaction);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching transaction", error: error.message });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const newTransaction = await prisma.transactions.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating transaction", error: error.message });
    }
};

export const deleteTransaction = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.transactions.delete({ where: { id } });
        res.json({ status: "success", message: "Transaction deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting transaction", error: error.message });
    }
};
