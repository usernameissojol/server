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
        "Authorization": `Bearer ${settings.redx_access_token || ""}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
};

/* Areas */
export const getAreas = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const response = await axios.get(`${BASE_URL}/areas`, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching Redx areas", error: error.response?.data || error.message });
    }
};

/* Stores */
export const getStores = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const response = await axios.get(`${BASE_URL}/stores`, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching Redx stores", error: error.response?.data || error.message });
    }
};

export const createStore = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const { name, phone, area_id, address } = req.body;
        const payload = { name, phone, area_id, address };
        const response = await axios.post(`${BASE_URL}/stores`, payload, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating Redx store", error: error.response?.data || error.message });
    }
};

export const getStoreDetails = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const { id } = req.params;
        const response = await axios.get(`${BASE_URL}/stores/${id}`, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching Redx store details", error: error.response?.data || error.message });
    }
};

/* Parcels / Orders */
export const createParcel = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const response = await axios.post(`${BASE_URL}/parcels`, req.body, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating Redx parcel", error: error.response?.data || error.message });
    }
};

export const getParcelDetails = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const { trackingId } = req.params;
        const response = await axios.get(`${BASE_URL}/parcels/${trackingId}`, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching Redx parcel details", error: error.response?.data || error.message });
    }
};

export const trackParcel = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";

        const { trackingId } = req.params;
        const response = await axios.get(`${BASE_URL}/parcels/${trackingId}/tracking`, { headers });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error tracking Redx parcel", error: error.response?.data || error.message });
    }
};
