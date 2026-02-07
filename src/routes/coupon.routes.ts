import { Router } from "express";
import { getCoupons, getPublicCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from "../controllers/coupon.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.post("/validate", validateCoupon);
router.get("/public", getPublicCoupons); // Public endpoint for active coupons
router.get("/", isAdmin, getCoupons);
router.post("/", isAdmin, createCoupon);
router.put("/:id", isAdmin, updateCoupon);
router.delete("/:id", isAdmin, deleteCoupon);

export default router;
