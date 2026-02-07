import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await prisma.coupons.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching coupons", error: error.message });
    }
};

export const getPublicCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await prisma.coupons.findMany({
            where: {
                status: 'active'
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching public coupons", error: error.message });
    }
};

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // Basic validation
        if (!data.code || !data.value) {
            return res.status(400).json({ status: "error", message: "Code and Value are required" });
        }

        const coupon = await prisma.coupons.create({
            data: {
                code: data.code,
                type: data.type || 'percentage',
                value: parseFloat(data.value),
                min_purchase: parseFloat(data.min_purchase || 0),
                max_discount: data.max_discount ? parseFloat(data.max_discount) : null,
                usage_limit: data.usage_limit ? parseInt(data.usage_limit) : null,
                start_date: data.start_date ? new Date(data.start_date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                status: data.status || 'active',
                is_auto: Boolean(data.is_auto),
                min_qty: data.min_qty ? parseInt(data.min_qty) : 0,
                free_shipping: Boolean(data.free_shipping)
            }
        });
        res.status(201).json({ status: "success", message: "Coupon created", coupon });
    } catch (error: any) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ status: "error", message: "Error creating coupon", error: error.message });
    }
};

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const coupon = await prisma.coupons.update({
            where: { id: parseInt(id as string) },
            data: {
                code: data.code,
                type: data.type,
                value: data.value,
                min_purchase: data.min_purchase,
                max_discount: data.max_discount,
                usage_limit: data.usage_limit ? parseInt(data.usage_limit) : undefined,
                start_date: data.start_date ? new Date(data.start_date) : undefined,
                end_date: data.end_date ? new Date(data.end_date) : undefined,
                status: data.status,
                is_auto: data.is_auto,
                min_qty: data.min_qty ? parseInt(data.min_qty) : undefined
            }
        });
        res.json({ status: "success", message: "Coupon updated", coupon });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating coupon", error: error.message });
    }
};

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.coupons.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Coupon deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting coupon", error: error.message });
    }
};

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ status: "error", message: "Coupon code is required" });

        const coupon = await prisma.coupons.findUnique({
            where: { code }
        });

        if (!coupon) {
            return res.status(404).json({ valid: false, message: "Invalid coupon code" });
        }

        if (coupon.status !== 'active') {
            return res.status(400).json({ valid: false, message: "This coupon is no longer active" });
        }

        const now = new Date();
        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return res.status(400).json({ valid: false, message: "This coupon is not yet active" });
        }

        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return res.status(400).json({ valid: false, message: "This coupon has expired" });
        }

        if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
            return res.status(400).json({ valid: false, message: "This coupon has reached its usage limit" });
        }

        res.json({ valid: true, coupon, message: "Coupon validated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error validating coupon", error: error.message });
    }
};
