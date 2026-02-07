import { Router } from "express";
import { getBrands, createBrand, updateBrand, deleteBrand, bulkDeleteBrands } from "../controllers/brand.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getBrands);
router.post("/", isAdmin, upload.single('logo'), createBrand);
router.post("/bulk-delete", isAdmin, bulkDeleteBrands);
router.post("/:id", isAdmin, upload.single('logo'), updateBrand);
router.delete("/:id", isAdmin, deleteBrand);

export default router;
