"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackParcel = exports.getParcelDetails = exports.createParcel = exports.getStoreDetails = exports.createStore = exports.getStores = exports.getAreas = void 0;
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
        "Authorization": `Bearer ${settings.redx_access_token || ""}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
};
/* Areas */
const getAreas = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const response = await axios_1.default.get(`${BASE_URL}/areas`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching Redx areas", error: error.response?.data || error.message });
    }
};
exports.getAreas = getAreas;
/* Stores */
const getStores = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const response = await axios_1.default.get(`${BASE_URL}/stores`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching Redx stores", error: error.response?.data || error.message });
    }
};
exports.getStores = getStores;
const createStore = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const { name, phone, area_id, address } = req.body;
        const payload = { name, phone, area_id, address };
        const response = await axios_1.default.post(`${BASE_URL}/stores`, payload, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating Redx store", error: error.response?.data || error.message });
    }
};
exports.createStore = createStore;
const getStoreDetails = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const { id } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/stores/${id}`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching Redx store details", error: error.response?.data || error.message });
    }
};
exports.getStoreDetails = getStoreDetails;
/* Parcels / Orders */
const createParcel = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const response = await axios_1.default.post(`${BASE_URL}/parcels`, req.body, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating Redx parcel", error: error.response?.data || error.message });
    }
};
exports.createParcel = createParcel;
const getParcelDetails = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const { trackingId } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/parcels/${trackingId}`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching Redx parcel details", error: error.response?.data || error.message });
    }
};
exports.getParcelDetails = getParcelDetails;
const trackParcel = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.redx_base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
        const { trackingId } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/parcels/${trackingId}/tracking`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error tracking Redx parcel", error: error.response?.data || error.message });
    }
};
exports.trackParcel = trackParcel;
