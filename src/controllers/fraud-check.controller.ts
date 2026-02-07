import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import axios from "axios";

// Get Blacklist
export const getBlacklist = async (req: Request, res: Response) => {
    try {
        const blacklist = await prisma.blacklist.findMany({
            orderBy: { created_at: "desc" },
        });
        res.json(blacklist);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching blacklist", error: error.message });
    }
};

// Add to Blacklist
export const addToBlacklist = async (req: Request, res: Response) => {
    try {
        const { type, value, reason } = req.body;

        const exists = await prisma.blacklist.findFirst({
            where: { value }
        });

        if (exists) {
            return res.status(400).json({ status: "error", message: "Entry already exists in blacklist" });
        }

        const entry = await prisma.blacklist.create({
            data: { type, value, reason }
        });

        res.json({ status: "success", message: "Added to blacklist", entry });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error adding to blacklist", error: error.message });
    }
};

// Remove from Blacklist
export const removeFromBlacklist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.blacklist.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Removed from blacklist" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error removing from blacklist", error: error.message });
    }
};

// Check Fraud
export const checkFraud = async (req: Request, res: Response) => {
    try {
        const { phone, ip, email } = req.body;

        const blacklist = await prisma.blacklist.findFirst({
            where: {
                OR: [
                    { type: "phone", value: phone },
                    { type: "ip", value: ip },
                    { type: "email", value: email }
                ]
            }
        });

        if (blacklist) {
            return res.json({
                status: "risk",
                message: `Potential Fraud Detected: ${blacklist.type} found in blacklist.`,
                reason: blacklist.reason
            });
        }

        res.json({ status: "safe", message: "No fraud detected." });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error checking fraud", error: error.message });
    }
};

// Check Fraud User (External + Internal)
export const checkFraudUser = async (req: Request, res: Response) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ status: "error", message: "Phone number is required" });
        }

        // 1. Internal Blacklist Check
        const internalResult = await prisma.blacklist.findFirst({
            where: { type: "phone", value: phone as string }
        });

        // 2. External Steadfast Check (if configured)
        const settingsList = await prisma.delivery_settings.findMany({
            where: { group: 'courier' }
        });
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string | null>);

        let externalData = null;
        let isFraud = !!internalResult;

        if (settings.steadfast_api_key && settings.steadfast_secret_key) {
            try {
                const response = await axios.get(`https://portal.packzy.com/api/v1/check-fraud-status`, {
                    params: { phone },
                    headers: {
                        "Api-Key": settings.steadfast_api_key,
                        "Secret-Key": settings.steadfast_secret_key,
                        "Content-Type": "application/json"
                    }
                });

                if (response.data && response.data.status === 200) {
                    externalData = {
                        raw: response.data,
                        delivery_ratio: response.data.delivery_ratio || 0,
                        success_rate: response.data.delivery_ratio || 0,
                    };

                    // Logic to determine if fraud based on ratio or reports
                    if (parseFloat(response.data.delivery_ratio) < 50 || (response.data.fraud_reports && response.data.fraud_reports.length > 0)) {
                        isFraud = true;
                    }
                }
            } catch (err: any) {
                console.error("Steadfast Fraud Check Error:", err.message);
                // Don't fail the whole request if external check fails
            }
        }

        res.json({
            status: "success",
            is_fraud: isFraud,
            internal: internalResult,
            external: externalData
        });

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error checking user fraud", error: error.message });
    }
};

export const checkFraudById = async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.id as string);

        if (isNaN(orderId)) {
            return res.status(400).json({ status: "error", message: "Invalid order ID" });
        }

        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            select: { guest_phone: true, user_id: true }
        });

        if (!order) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }

        let phone = order.guest_phone;

        if (!phone && order.user_id) {
            const user = await prisma.users.findUnique({
                where: { id: order.user_id },
                select: { phone: true }
            });
            phone = user?.phone || null;
        }

        if (!phone) {
            return res.status(400).json({ status: "error", message: "Order has no associated phone number" });
        }

        // Reuse existing checkFraudUser logic logic but internal call
        // 1. Internal Blacklist Check
        const internalResult = await prisma.blacklist.findFirst({
            where: { type: "phone", value: phone }
        });

        // 2. External Steadfast Check (if configured)
        const settingsList = await prisma.delivery_settings.findMany({
            where: { group: 'courier' }
        });
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string | null>);

        let externalData = null;
        let isFraud = !!internalResult;

        if (settings.steadfast_api_key && settings.steadfast_secret_key) {
            try {
                const response = await axios.get(`https://portal.packzy.com/api/v1/check-fraud-status`, {
                    params: { phone },
                    headers: {
                        "Api-Key": settings.steadfast_api_key,
                        "Secret-Key": settings.steadfast_secret_key,
                        "Content-Type": "application/json"
                    }
                });

                if (response.data && response.data.status === 200) {
                    externalData = {
                        raw: response.data,
                        delivery_ratio: response.data.delivery_ratio || 0,
                        success_rate: response.data.delivery_ratio || 0,
                    };

                    if (parseFloat(response.data.delivery_ratio) < 50 || (response.data.fraud_reports && response.data.fraud_reports.length > 0)) {
                        isFraud = true;
                    }
                }
            } catch (err: any) {
                console.error("Steadfast Fraud Check Error:", err.message);
            }
        }

        res.json({
            status: "success",
            is_fraud: isFraud,
            internal: internalResult,
            external: externalData,
            message: isFraud ? "High risk detected" : "Order appears safe"
        });

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error checking order fraud", error: error.message });
    }
};
