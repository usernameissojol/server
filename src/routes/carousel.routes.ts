import { Router } from "express";
import { getCarousels, getAllCarouselsAdmin, createCarousel, updateCarousel, deleteCarousel } from "../controllers/carousel.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/admin", isAdmin, getAllCarouselsAdmin); // Get all carousels for admin
router.get("/", getCarousels); // Get active carousels for frontend
router.post("/", isAdmin, upload.single("image"), createCarousel);
router.post("/:id", isAdmin, upload.single("image"), updateCarousel); // For multipart updates
router.put("/:id", isAdmin, upload.single("image"), updateCarousel);
router.delete("/:id", isAdmin, deleteCarousel);

export default router;
