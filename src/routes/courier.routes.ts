import express from "express";
import { createCourierOrder, checkDeliveryStatus, getCourierBalance } from "../controllers/courier.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/create-order", isAdmin, createCourierOrder);
router.get("/status/:invoice", isAdmin, checkDeliveryStatus);
router.get("/balance", isAdmin, getCourierBalance);

export default router;
