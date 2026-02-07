"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.isAdmin, order_controller_1.getOrders);
router.get("/stats", auth_middleware_1.isAdmin, order_controller_1.getOrderStats);
router.get("/:id", auth_middleware_1.isAdmin, order_controller_1.getOrderById);
router.post("/", order_controller_1.createOrder); // Allow creation by users
router.post("/batch", auth_middleware_1.isAdmin, order_controller_1.handleBatchActions);
router.post("/:id/courier", auth_middleware_1.isAdmin, order_controller_1.assignCourier); // Ensure this route is defined
router.post("/:id", auth_middleware_1.isAdmin, order_controller_1.updateOrder);
router.delete("/:id", auth_middleware_1.isAdmin, order_controller_1.deleteOrder);
exports.default = router;
