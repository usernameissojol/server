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
        "paperfly-key": settings.paperfly_key || "",
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
};

/* 
  Paperfly usually uses Basic Auth string or custom headers. 
  Codeboxr package suggests: username, password, key.
  We'll format request based on common Paperfly API structures (often JSON body with user/pass).
*/

export const createOrder = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.paperfly_base_url || "https://sandbox.paperfly-bd.com/api/v1";

        /*
          Required fields: merOrderRef, pickMerchantName, pickMerchantAddress, pickMerchantThana, 
          pickMerchantDistrict, pickupMerchantPhone, productSizeWeight, productBrief, packagePrice, 
          deliveryOption, custname, custaddress, customerThana, customerDistrict, custPhone, max_weight
        */
        const payload = {
            ...req.body,
            username: settings.paperfly_username,
            password: settings.paperfly_password
            // Some Paperfly endpoints require wrapping details in `orders` array
        };

        const response = await axios.post(`${BASE_URL}/order-placement`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating Paperfly order", error: error.response?.data || error.message });
    }
};

export const trackOrder = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.paperfly_base_url || "https://sandbox.paperfly-bd.com/api/v1";

        const { trackingNumber } = req.params;
        const payload = {
            username: settings.paperfly_username,
            password: settings.paperfly_password,
            ReferenceNumber: trackingNumber
        };
        const response = await axios.post(`${BASE_URL}/tracking`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error tracking Paperfly order", error: error.response?.data || error.message });
    }
};

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.paperfly_base_url || "https://sandbox.paperfly-bd.com/api/v1";

        const { referenceNumber } = req.params;
        const payload = {
            username: settings.paperfly_username,
            password: settings.paperfly_password,
            invoiceNumber: referenceNumber
        };
        const response = await axios.post(`${BASE_URL}/single-invoice-details`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching Paperfly invoice details", error: error.response?.data || error.message });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.paperfly_base_url || "https://sandbox.paperfly-bd.com/api/v1";

        const { referenceNumber } = req.params;
        const payload = {
            username: settings.paperfly_username,
            password: settings.paperfly_password,
            merOrderRef: referenceNumber
        };
        const response = await axios.post(`${BASE_URL}/cancel-order`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error canceling Paperfly order", error: error.response?.data || error.message });
    }
};
