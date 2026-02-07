"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueToken = exports.calculatePrice = exports.createOrder = exports.createStore = exports.getStores = exports.getAreas = exports.getZones = exports.getCities = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const getSettings = async () => {
    const settings = await prisma_1.prisma.delivery_settings.findMany({
        where: { group: 'courier' }
    });
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
};
// Helper to get headers
const getHeaders = async () => {
    const settings = await getSettings();
    return {
        "Authorization": `Bearer ${settings.pathao_access_token || ""}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
};
/*
   Authentication / Token Management is manually handled via .env for now,
   similar to the Laravel package requesting a one-time setup.
*/
// Get Cities
const getCities = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const { country_id } = req.query; // Usually 1 for Bangladesh
        const response = await axios_1.default.get(`${BASE_URL}/aladdin/api/v1/countries/${country_id || 1}/city-list`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching cities", error: error.response?.data || error.message });
    }
};
exports.getCities = getCities;
// Get Zones
const getZones = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const { city_id } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/aladdin/api/v1/cities/${city_id}/zone-list`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching zones", error: error.response?.data || error.message });
    }
};
exports.getZones = getZones;
// Get Areas
const getAreas = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const { zone_id } = req.params;
        const response = await axios_1.default.get(`${BASE_URL}/aladdin/api/v1/zones/${zone_id}/area-list`, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching areas", error: error.response?.data || error.message });
    }
};
exports.getAreas = getAreas;
// Get Stores
const getStores = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        // Pagination logic if needed, Pathao allows ?page=X
        const { page } = req.query;
        const url = `${BASE_URL}/aladdin/api/v1/stores${page ? `?page=${page}` : ''}`;
        const response = await axios_1.default.get(url, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching stores", error: error.response?.data || error.message });
    }
};
exports.getStores = getStores;
// Create Store
const createStore = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const { name, contact_name, contact_number, address, city_id, zone_id, area_id } = req.body;
        const payload = {
            name,
            contact_name,
            contact_number,
            address,
            city_id: parseInt(city_id),
            zone_id: parseInt(zone_id),
            area_id: parseInt(area_id)
        };
        const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/stores`, payload, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating store", error: error.response?.data || error.message });
    }
};
exports.createStore = createStore;
// Create Order
const createOrder = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        /*
          Pathao Required Fields:
          store_id, sender_name, sender_phone, recipient_name, recipient_phone,
          recipient_address, recipient_city, recipient_zone, recipient_area,
          delivery_type (48 Normal, 12 OnDemand), item_type (1 Doc, 2 Parcel),
          item_quantity, item_weight, amount_to_collect
        */
        const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/orders`, req.body, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating order", error: error.response?.data || error.message });
    }
};
exports.createOrder = createOrder;
// Price Calculation
const calculatePrice = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/merchant/price-plan`, req.body, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error calculating price", error: error.response?.data || error.message });
    }
};
exports.calculatePrice = calculatePrice;
// Login / Issue Token (Optional Helper)
const issueToken = async (req, res) => {
    try {
        const settings = await getSettings();
        const BASE_URL = settings.pathao_base_url || "https://api-hermes.pathao.com";
        const { client_id, client_secret, username, password } = req.body;
        const payload = {
            client_id: client_id || settings.pathao_client_id,
            client_secret: client_secret || settings.pathao_client_secret,
            username: username || settings.pathao_username,
            password: password || settings.pathao_password,
            grant_type: "password"
        };
        const response = await axios_1.default.post(`${BASE_URL}/aladdin/api/v1/issue-token`, payload);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error issuing token", error: error.response?.data || error.message });
    }
};
exports.issueToken = issueToken;
