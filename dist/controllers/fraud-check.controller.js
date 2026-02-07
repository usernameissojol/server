"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFraudById = exports.checkFraudUser = exports.checkFraud = exports.removeFromBlacklist = exports.addToBlacklist = exports.getBlacklist = void 0;
const prisma_1 = require("../lib/prisma");
const axios_1 = __importDefault(require("axios"));
// Get Blacklist
const getBlacklist = async (req, res) => {
    try {
        const blacklist = await prisma_1.prisma.blacklist.findMany({
            orderBy: { created_at: "desc" },
        });
        res.json(blacklist);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching blacklist", error: error.message });
    }
};
exports.getBlacklist = getBlacklist;
// Add to Blacklist
const addToBlacklist = async (req, res) => {
    try {
        const { type, value, reason } = req.body;
        const exists = await prisma_1.prisma.blacklist.findFirst({
            where: { value }
        });
        if (exists) {
            return res.status(400).json({ status: "error", message: "Entry already exists in blacklist" });
        }
        const entry = await prisma_1.prisma.blacklist.create({
            data: { type, value, reason }
        });
        res.json({ status: "success", message: "Added to blacklist", entry });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error adding to blacklist", error: error.message });
    }
};
exports.addToBlacklist = addToBlacklist;
// Remove from Blacklist
const removeFromBlacklist = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.blacklist.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Removed from blacklist" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error removing from blacklist", error: error.message });
    }
};
exports.removeFromBlacklist = removeFromBlacklist;
// Check Fraud
const checkFraud = async (req, res) => {
    try {
        const { phone, ip, email } = req.body;
        const blacklist = await prisma_1.prisma.blacklist.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error checking fraud", error: error.message });
    }
};
exports.checkFraud = checkFraud;
// Check Fraud User (External + Internal)
const checkFraudUser = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ status: "error", message: "Phone number is required" });
        }
        // 1. Internal Blacklist Check
        const internalResult = await prisma_1.prisma.blacklist.findFirst({
            where: { type: "phone", value: phone }
        });
        // 2. External Steadfast Check (if configured)
        const settingsList = await prisma_1.prisma.delivery_settings.findMany({
            where: { group: 'courier' }
        });
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        let externalData = null;
        let isFraud = !!internalResult;
        if (settings.steadfast_api_key && settings.steadfast_secret_key) {
            try {
                const response = await axios_1.default.get(`https://portal.packzy.com/api/v1/check-fraud-status`, {
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
            }
            catch (err) {
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error checking user fraud", error: error.message });
    }
};
exports.checkFraudUser = checkFraudUser;
const checkFraudById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ status: "error", message: "Invalid order ID" });
        }
        const order = await prisma_1.prisma.orders.findUnique({
            where: { id: orderId },
            select: { guest_phone: true, user_id: true }
        });
        if (!order) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }
        let phone = order.guest_phone;
        if (!phone && order.user_id) {
            const user = await prisma_1.prisma.users.findUnique({
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
        const internalResult = await prisma_1.prisma.blacklist.findFirst({
            where: { type: "phone", value: phone }
        });
        // 2. External Steadfast Check (if configured)
        const settingsList = await prisma_1.prisma.delivery_settings.findMany({
            where: { group: 'courier' }
        });
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        let externalData = null;
        let isFraud = !!internalResult;
        if (settings.steadfast_api_key && settings.steadfast_secret_key) {
            try {
                const response = await axios_1.default.get(`https://portal.packzy.com/api/v1/check-fraud-status`, {
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
            }
            catch (err) {
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error checking order fraud", error: error.message });
    }
};
exports.checkFraudById = checkFraudById;
