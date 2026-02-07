"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const revenue_controller_1 = require("../controllers/revenue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.isAdmin, revenue_controller_1.getIncomeCategories);
router.post("/", auth_middleware_1.isAdmin, revenue_controller_1.createIncomeCategory);
router.post("/:id", auth_middleware_1.isAdmin, revenue_controller_1.updateIncomeCategory); // POST with _method=PUT from client
router.delete("/:id", auth_middleware_1.isAdmin, revenue_controller_1.deleteIncomeCategory);
exports.default = router;
