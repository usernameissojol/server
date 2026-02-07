import { Request, Response } from "express";
import axios from "axios";

import { prisma } from "../lib/prisma";

const getSettings = async () => {
    const settings = await prisma.delivery_settings.findMany({
        where: { group: 'courier' }
    });
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string | null>);
};

const getHeaders = async () => {
    const settings = await getSettings();
    return {
        "API-KEY": settings.ecourier_api_key || "",
        "API-SECRET": settings.ecourier_api_secret || "",
        "USER-ID": settings.ecourier_user_id || "",
        "Content-Type": "application/json"
    };
};

/* Place Order */
export const placeOrder = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const response = await axios.post(`${BASE_URL}/order-place`, req.body, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error placing eCourier order", error: error.response?.data || error.message });
    }
};

/* Track Parcel */
export const trackParcel = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { product_id, ecr } = req.body; // Can track by either
        const payload = { product_id, ecr };
        const response = await axios.post(`${BASE_URL}/track`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error tracking eCourier parcel", error: error.response?.data || error.message });
    }
};

/* Cancel Order */
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { tracking, comment } = req.body;
        const payload = { tracking, comment };
        const response = await axios.post(`${BASE_URL}/cancel-order`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error canceling eCourier order", error: error.response?.data || error.message });
    }
};

/* Fraud Alert Check */
export const checkFraudParams = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { number } = req.body;
        const response = await axios.post(`${BASE_URL}/fraud-status-check`, { number }, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error checking fraud status", error: error.response?.data || error.message });
    }
};

/* Locations: City List */
export const getCityList = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const response = await axios.post(`${BASE_URL}/city-list`, {}, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching cities", error: error.response?.data || error.message });
    }
};

/* Locations: Thana List */
export const getThanaList = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { city } = req.body;
        const response = await axios.post(`${BASE_URL}/thana-list`, { city }, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching thanas", error: error.response?.data || error.message });
    }
};

/* Locations: Area List by Post Code */
export const getAreaList = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { postcode } = req.body;
        const response = await axios.post(`${BASE_URL}/area-list`, { postcode }, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching areas", error: error.response?.data || error.message });
    }
};

/* Locations: Post Code List */
export const getPostCodeList = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { city, thana } = req.body;
        const response = await axios.post(`${BASE_URL}/postcode-list`, { city, thana }, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching postcodes", error: error.response?.data || error.message });
    }
};

/* Payment Status */
export const getPaymentStatus = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";

        const { tracking } = req.body;
        const response = await axios.post(`${BASE_URL}/payment-status`, { tracking }, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching payment status", error: error.response?.data || error.message });
    }
};
