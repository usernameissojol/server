"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethod = exports.updatePaymentMethod = exports.createPaymentMethod = exports.getPaymentMethods = void 0;
const prisma_1 = require("../lib/prisma");
const getPaymentMethods = async (req, res) => {
    try {
        const methods = await prisma_1.prisma.payment_methods.findMany({
            orderBy: { created_at: "desc" },
        });
        res.json(methods);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching payment methods", error: error.message });
    }
};
exports.getPaymentMethods = getPaymentMethods;
const createPaymentMethod = async (req, res) => {
    try {
        const { provider, type, account_number, instruction, is_active } = req.body;
        const method = await prisma_1.prisma.payment_methods.create({
            data: {
                provider,
                type,
                account_number,
                instruction,
                is_active: is_active === 1 || is_active === true
            }
        });
        res.json({ status: "success", message: "Payment method added", method });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating payment method", error: error.message });
    }
};
exports.createPaymentMethod = createPaymentMethod;
const updatePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const { provider, type, account_number, instruction, is_active } = req.body;
        await prisma_1.prisma.payment_methods.update({
            where: { id: parseInt(id) },
            data: {
                provider,
                type,
                account_number,
                instruction,
                is_active: is_active === 1 || is_active === true
            }
        });
        res.json({ status: "success", message: "Payment method updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating payment method", error: error.message });
    }
};
exports.updatePaymentMethod = updatePaymentMethod;
const deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.payment_methods.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Payment method deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting payment method", error: error.message });
    }
};
exports.deletePaymentMethod = deletePaymentMethod;
