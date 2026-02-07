import express from "express";
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "../controllers/payment-method.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getPaymentMethods);
router.post("/", isAdmin, createPaymentMethod);
router.post("/:id", isAdmin, updatePaymentMethod); // Support for both PUT and POST for update
router.put("/:id", isAdmin, updatePaymentMethod);
router.delete("/:id", isAdmin, deletePaymentMethod);

export default router;
