import express from "express";
import { createOrder, trackOrder, getOrderDetails, cancelOrder } from "../controllers/paperfly.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/orders", isAdmin, createOrder);
router.post("/orders/cancel/:referenceNumber", isAdmin, cancelOrder);
router.get("/orders/:referenceNumber", isAdmin, getOrderDetails);
router.get("/tracking/:trackingNumber", isAdmin, trackOrder);

export default router;
