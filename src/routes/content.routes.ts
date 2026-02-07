import { Router } from "express";
import { getSettings, getActivePopup, getFooterLinks, listSettings, updateSetting, bulkUpdateSettings, getSettingsByGroup } from "../controllers/content.controller";
import { isAdmin } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", listSettings);
router.put("/", isAdmin, updateSetting);
router.put("/bulk", isAdmin, bulkUpdateSettings);
router.post("/bulk", isAdmin, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), bulkUpdateSettings); // FormData with file uploads
router.get("/group/:group", getSettingsByGroup);
router.get("/settings", getSettings);
router.get("/active-popup", getActivePopup);
router.get("/footer-links", getFooterLinks);

export default router;
