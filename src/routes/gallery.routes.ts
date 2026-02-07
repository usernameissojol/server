import { Router } from "express";
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem, bulkDeleteGalleryItems } from "../controllers/gallery.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getGalleryItems);
router.post("/", isAdmin, upload.array("images[]"), uploadGalleryItem);
router.post("/bulk-delete", isAdmin, bulkDeleteGalleryItems);
router.delete("/:id", isAdmin, deleteGalleryItem);

export default router;
