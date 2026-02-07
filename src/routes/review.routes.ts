import { Router } from "express";
import { getReviews, getReviewById, updateReviewStatus, updateReview, getProductReviews, createReview, deleteReview } from "../controllers/review.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getReviews); // For admin usually
router.get("/:id", getReviewById);
router.get("/product/:id", getProductReviews); // Public access
router.post("/", createReview); // Public/User access
router.put("/:id/status", isAdmin, updateReviewStatus);
router.put("/:id", isAdmin, updateReview);
router.post("/:id", isAdmin, updateReview); // For compatibility with some frontend calls
router.delete("/:id", isAdmin, deleteReview);

export default router;
