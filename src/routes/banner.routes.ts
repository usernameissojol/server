import { Router } from "express";
import { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner } from "../controllers/banner.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/admin", isAdmin, getAllBannersAdmin); // Get all banners for admin
router.get("/", getBanners); // Get active banners for frontend
router.post("/", isAdmin, upload.single("image"), createBanner);
router.post("/:id", isAdmin, upload.single("image"), updateBanner); // For multipart updates
router.put("/:id", isAdmin, upload.single("image"), updateBanner);
router.delete("/:id", isAdmin, deleteBanner);

export default router;
