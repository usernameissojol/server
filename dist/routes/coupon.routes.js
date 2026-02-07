"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/validate", coupon_controller_1.validateCoupon);
router.get("/public", coupon_controller_1.getPublicCoupons); // Public endpoint for active coupons
router.get("/", auth_middleware_1.isAdmin, coupon_controller_1.getCoupons);
router.post("/", auth_middleware_1.isAdmin, coupon_controller_1.createCoupon);
router.put("/:id", auth_middleware_1.isAdmin, coupon_controller_1.updateCoupon);
router.delete("/:id", auth_middleware_1.isAdmin, coupon_controller_1.deleteCoupon);
exports.default = router;
