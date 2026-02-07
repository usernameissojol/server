import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getPaymentMethods = async (req: Request, res: Response) => {
    try {
        const methods = await prisma.payment_methods.findMany({
            orderBy: { created_at: "desc" },
        });
        res.json(methods);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching payment methods", error: error.message });
    }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
    try {
        const { provider, type, account_number, instruction, is_active } = req.body;
        const method = await prisma.payment_methods.create({
            data: {
                provider,
                type,
                account_number,
                instruction,
                is_active: is_active === 1 || is_active === true
            }
        });
        res.json({ status: "success", message: "Payment method added", method });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating payment method", error: error.message });
    }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { provider, type, account_number, instruction, is_active } = req.body;
        await prisma.payment_methods.update({
            where: { id: parseInt(id as string) },
            data: {
                provider,
                type,
                account_number,
                instruction,
                is_active: is_active === 1 || is_active === true
            }
        });
        res.json({ status: "success", message: "Payment method updated" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating payment method", error: error.message });
    }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.payment_methods.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Payment method deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting payment method", error: error.message });
    }
};
