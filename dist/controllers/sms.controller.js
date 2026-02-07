"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSMS = void 0;
const prisma_1 = require("../lib/prisma");
const axios_1 = __importDefault(require("axios"));
const testSMS = async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ status: "error", message: "Phone and message are required" });
        }
        // Fetch SMS settings from DB
        const settingsList = await prisma_1.prisma.sms_settings.findMany();
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        const provider = settings.sms_provider || "BulkSMSBD";
        const apiKey = settings.sms_api_key;
        const senderId = settings.sms_sender_id;
        if (!apiKey) {
            return res.status(400).json({ status: "error", message: "SMS API Key is not configured" });
        }
        // Implementation for common providers (Example: BulkSMSBD)
        if (provider === "BulkSMSBD") {
            try {
                const response = await axios_1.default.get("https://bulksmsbd.net/api/smsapi", {
                    params: {
                        api_key: apiKey,
                        type: "text",
                        number: phone,
                        senderid: senderId,
                        message: message
                    }
                });
                if (response.data.success_message) {
                    return res.json({ status: "success", message: "SMS sent successfully via BulkSMSBD", raw: response.data });
                }
                else {
                    return res.status(400).json({ status: "error", message: response.data.error_message || "Failed to send SMS", raw: response.data });
                }
            }
            catch (err) {
                return res.status(500).json({ status: "error", message: "BulkSMSBD API Error", error: err.message });
            }
        }
        // Fallback or other providers can be added here
        res.json({
            status: "success",
            message: `Test SMS request received for ${provider}. (Actual integration for this provider may be pending)`,
            details: { phone, message, provider }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error processing test SMS", error: error.message });
    }
};
exports.testSMS = testSMS;
