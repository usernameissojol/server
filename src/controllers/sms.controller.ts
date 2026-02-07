import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import axios from "axios";

export const testSMS = async (req: Request, res: Response) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ status: "error", message: "Phone and message are required" });
        }

        // Fetch SMS settings from DB
        const settingsList = await prisma.sms_settings.findMany();
        const settings = settingsList.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string | null>);

        const provider = settings.sms_provider || "BulkSMSBD";
        const apiKey = settings.sms_api_key;
        const senderId = settings.sms_sender_id;

        if (!apiKey) {
            return res.status(400).json({ status: "error", message: "SMS API Key is not configured" });
        }

        // Implementation for common providers (Example: BulkSMSBD)
        if (provider === "BulkSMSBD") {
            try {
                const response = await axios.get("https://bulksmsbd.net/api/smsapi", {
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
                } else {
                    return res.status(400).json({ status: "error", message: response.data.error_message || "Failed to send SMS", raw: response.data });
                }
            } catch (err: any) {
                return res.status(500).json({ status: "error", message: "BulkSMSBD API Error", error: err.message });
            }
        }

        // Fallback or other providers can be added here
        res.json({
            status: "success",
            message: `Test SMS request received for ${provider}. (Actual integration for this provider may be pending)`,
            details: { phone, message, provider }
        });

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error processing test SMS", error: error.message });
    }
};
