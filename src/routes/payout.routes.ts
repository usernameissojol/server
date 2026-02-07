import express from "express";
import {
    getPayoutMethods, createPayoutMethod, deletePayoutMethod,
    getPayouts, createPayout, updatePayoutStatus, getPayoutStats
} from "../controllers/payout.controller";

const router = express.Router();

// Stats must come before generic :id
router.get("/stats", getPayoutStats);

// Methods
router.get("/methods", getPayoutMethods);
router.post("/methods", createPayoutMethod);
router.delete("/methods/:id", deletePayoutMethod);

// Payouts
router.get("/", getPayouts);
router.post("/", createPayout);
router.post("/:id", updatePayoutStatus); // Use POST for status update action if preferred over PUT

export default router;
