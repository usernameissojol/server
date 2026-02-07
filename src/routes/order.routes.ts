import { Router } from "express";
import { getOrders, getOrderStats, deleteOrder, getOrderById, createOrder, updateOrder, handleBatchActions, assignCourier } from "../controllers/order.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAdmin, getOrders);
router.get("/stats", isAdmin, getOrderStats);
router.get("/:id", isAdmin, getOrderById);
router.post("/", createOrder); // Allow creation by users
router.post("/batch", isAdmin, handleBatchActions);
router.post("/:id/courier", isAdmin, assignCourier); // Ensure this route is defined
router.post("/:id", isAdmin, updateOrder);
router.delete("/:id", isAdmin, deleteOrder);

export default router;
