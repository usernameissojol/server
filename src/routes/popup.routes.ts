import { Router } from "express";
import { getPopups, createPopup, updatePopup, deletePopup } from "../controllers/popup.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", isAdmin, getPopups);
router.post("/", isAdmin, upload.single("image"), createPopup);
router.put("/:id", isAdmin, upload.single("image"), updatePopup);
router.delete("/:id", isAdmin, deletePopup);

export default router;
