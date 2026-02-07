"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const revenue_controller_1 = require("../controllers/revenue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/stats", auth_middleware_1.isAdmin, revenue_controller_1.getRevenueStats);
router.get("/", auth_middleware_1.isAdmin, revenue_controller_1.getAllRevenues);
router.post("/", auth_middleware_1.isAdmin, revenue_controller_1.createRevenue);
router.post("/:id", auth_middleware_1.isAdmin, revenue_controller_1.updateRevenue); // POST with _method=PUT from client
router.delete("/:id", auth_middleware_1.isAdmin, revenue_controller_1.deleteRevenue);
exports.default = router;
