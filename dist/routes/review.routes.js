"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", review_controller_1.getReviews); // For admin usually
router.get("/:id", review_controller_1.getReviewById);
router.get("/product/:id", review_controller_1.getProductReviews); // Public access
router.post("/", review_controller_1.createReview); // Public/User access
router.put("/:id/status", auth_middleware_1.isAdmin, review_controller_1.updateReviewStatus);
router.put("/:id", auth_middleware_1.isAdmin, review_controller_1.updateReview);
router.post("/:id", auth_middleware_1.isAdmin, review_controller_1.updateReview); // For compatibility with some frontend calls
router.delete("/:id", auth_middleware_1.isAdmin, review_controller_1.deleteReview);
exports.default = router;
