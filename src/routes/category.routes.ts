import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, bulkDeleteCategories } from "../controllers/category.controller";
import { upload } from "../middleware/upload";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCategories);
router.post("/", isAdmin, upload.single("image"), createCategory);
router.post("/bulk-delete", isAdmin, bulkDeleteCategories);
router.post("/:id", isAdmin, upload.single("image"), updateCategory);
router.delete("/:id", isAdmin, deleteCategory);

export default router;
