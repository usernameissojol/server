import { Router } from "express";
import {
    getRevenueStats,
    getAllRevenues,
    createRevenue,
    updateRevenue,
    deleteRevenue
} from "../controllers/revenue.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", isAdmin, getRevenueStats);
router.get("/", isAdmin, getAllRevenues);
router.post("/", isAdmin, createRevenue);
router.post("/:id", isAdmin, updateRevenue); // POST with _method=PUT from client
router.delete("/:id", isAdmin, deleteRevenue);

export default router;
