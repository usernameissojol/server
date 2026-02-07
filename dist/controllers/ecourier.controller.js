"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.getPostCodeList = exports.getAreaList = exports.getThanaList = exports.getCityList = exports.checkFraudParams = exports.cancelOrder = exports.trackParcel = exports.placeOrder = void 0;
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
        "API-KEY": settings.ecourier_api_key || "",
        "API-SECRET": settings.ecourier_api_secret || "",
        "USER-ID": settings.ecourier_user_id || "",
        "Content-Type": "application/json"
    };
};
/* Place Order */
const placeOrder = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const response = await axios_1.default.post(`${BASE_URL}/order-place`, req.body, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error placing eCourier order", error: error.response?.data || error.message });
    }
};
exports.placeOrder = placeOrder;
/* Track Parcel */
const trackParcel = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { product_id, ecr } = req.body; // Can track by either
        const payload = { product_id, ecr };
        const response = await axios_1.default.post(`${BASE_URL}/track`, payload, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error tracking eCourier parcel", error: error.response?.data || error.message });
    }
};
exports.trackParcel = trackParcel;
/* Cancel Order */
const cancelOrder = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { tracking, comment } = req.body;
        const payload = { tracking, comment };
        const response = await axios_1.default.post(`${BASE_URL}/cancel-order`, payload, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error canceling eCourier order", error: error.response?.data || error.message });
    }
};
exports.cancelOrder = cancelOrder;
/* Fraud Alert Check */
const checkFraudParams = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { number } = req.body;
        const response = await axios_1.default.post(`${BASE_URL}/fraud-status-check`, { number }, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error checking fraud status", error: error.response?.data || error.message });
    }
};
exports.checkFraudParams = checkFraudParams;
/* Locations: City List */
const getCityList = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const response = await axios_1.default.post(`${BASE_URL}/city-list`, {}, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching cities", error: error.response?.data || error.message });
    }
};
exports.getCityList = getCityList;
/* Locations: Thana List */
const getThanaList = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { city } = req.body;
        const response = await axios_1.default.post(`${BASE_URL}/thana-list`, { city }, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching thanas", error: error.response?.data || error.message });
    }
};
exports.getThanaList = getThanaList;
/* Locations: Area List by Post Code */
const getAreaList = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { postcode } = req.body;
        const response = await axios_1.default.post(`${BASE_URL}/area-list`, { postcode }, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching areas", error: error.response?.data || error.message });
    }
};
exports.getAreaList = getAreaList;
/* Locations: Post Code List */
const getPostCodeList = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { city, thana } = req.body;
        const response = await axios_1.default.post(`${BASE_URL}/postcode-list`, { city, thana }, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching postcodes", error: error.response?.data || error.message });
    }
};
exports.getPostCodeList = getPostCodeList;
/* Payment Status */
const getPaymentStatus = async (req, res) => {
    try {
        const settings = await getSettings();
        const headers = await getHeaders();
        const BASE_URL = settings.ecourier_base_url || "https://staging.ecourier.com.bd/api";
        const { tracking } = req.body;
        const response = await axios_1.default.post(`${BASE_URL}/payment-status`, { tracking }, { headers });
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching payment status", error: error.response?.data || error.message });
    }
};
exports.getPaymentStatus = getPaymentStatus;
