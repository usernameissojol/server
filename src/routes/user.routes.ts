import { Router } from "express";
import { getProfile, updateProfile, uploadProfileImage, getOrders, updatePassword } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

// Retrieve profile
router.get("/profile", authenticate, getProfile);

// Update profile details
router.post("/profile", authenticate, updateProfile);

// Upload profile image
router.post("/profile/image", authenticate, upload.single("image"), uploadProfileImage);

// Get user orders
router.get("/orders", authenticate, getOrders);

// Change password
router.post("/update-password", authenticate, updatePassword);

export default router;
