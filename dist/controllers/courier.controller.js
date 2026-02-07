"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourierBalance = exports.checkDeliveryStatus = exports.createCourierOrder = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const getSettings = async () => {
    const settings = await prisma_1.prisma.delivery_settings.findMany({
        where: { group: 'courier' }
    });
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
};
const getHeaders = async () => {
    const settings = await getSettings();
    return {
        "Api-Key": settings.steadfast_api_key || "",
        "Secret-Key": settings.steadfast_secret_key || "",
        "Content-Type": "application/json"
    };
};
// Create Order
const createCourierOrder = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.steadfast_base_url || "https://portal.packzy.com/api/v1";
        const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body;
        const payload = {
            invoice,
            recipient_name,
            recipient_phone,
            recipient_address,
            cod_amount,
            note
        };
        const response = await axios_1.default.post(`${BASE_URL}/create_order`, payload, { headers });
        if (response.data.status === 200) {
            // Optionally update local order status here
            // const order = await prisma.orders.findUnique(...) 
        }
        res.json(response.data);
    }
    catch (error) {
        console.error("Steadfast API Error:", error.response?.data || error.message);
        res.status(500).json({
            status: "error",
            message: "Error creating courier order",
            error: error.response?.data || error.message
        });
    }
};
exports.createCourierOrder = createCourierOrder;
// Check Delivery Status by Invoice
const checkDeliveryStatus = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.steadfast_base_url || "https://portal.packzy.com/api/v1";
        const { invoice } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/status_by_invoice/${invoice}`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching status", error: error.message });
    }
};
exports.checkDeliveryStatus = checkDeliveryStatus;
// Get Balance
// Get Balance
const getCourierBalance = async (req, res) => {
    try {
        const { provider } = req.query;
        const p = provider?.toLowerCase() || "";
        if (p.includes("steadfast")) {
            const settings = await getSettings();
            if (!settings.steadfast_api_key || !settings.steadfast_secret_key) {
                return res.status(400).json({
                    status: "error",
                    message: "Steadfast API credentials are missing. Please configure them in Settings > Courier."
                });
            }
            const headers = await getHeaders();
            // Steadfast specific logic
            const BASE_URL = settings.steadfast_base_url || "https://portal.packzy.com/api/v1";
            const response = await axios_1.default.get(`${BASE_URL}/get_balance`, { headers });
            return res.json(response.data);
        }
        // Placeholder for other couriers if they support balance check
        if (p.includes("pathao")) {
            // Pathao balance logic here if available
            return res.json({ status: 200, balance: 0, note: "Balance check not implemented for Pathao" });
        }
        if (p.includes("redx")) {
            return res.json({ status: 200, balance: 0, note: "Balance check not implemented for Redx" });
        }
        if (p.includes("paperfly")) {
            return res.json({ status: 200, balance: 0, note: "Balance check not implemented for Paperfly" });
        }
        if (p.includes("courier")) { // eCourier
            return res.json({ status: 200, balance: 0, note: "Balance check not implemented for eCourier" });
        }
        // Default or unknown
        res.status(400).json({ status: "error", message: "Unknown or unsupported provider", provider });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching balance", error: error.message });
    }
};
exports.getCourierBalance = getCourierBalance;
