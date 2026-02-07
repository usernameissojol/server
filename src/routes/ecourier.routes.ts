import express from "express";
import {
    placeOrder,
    trackParcel,
    cancelOrder,
    checkFraudParams,
    getCityList,
    getThanaList,
    getAreaList,
    getPostCodeList,
    getPaymentStatus
} from "../controllers/ecourier.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// Order Management
router.post("/orders", isAdmin, placeOrder);
router.post("/orders/cancel", isAdmin, cancelOrder);
router.post("/tracking", isAdmin, trackParcel);
router.post("/fraud-check", isAdmin, checkFraudParams);
router.post("/payment-status", isAdmin, getPaymentStatus);

// Location Data
router.post("/cities", getCityList);
router.post("/thanas", getThanaList);
router.post("/areas", getAreaList);
router.post("/postcodes", getPostCodeList);

export default router;
