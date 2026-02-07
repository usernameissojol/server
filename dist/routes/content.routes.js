"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const content_controller_1 = require("../controllers/content.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/", content_controller_1.listSettings);
router.put("/", auth_middleware_1.isAdmin, content_controller_1.updateSetting);
router.put("/bulk", auth_middleware_1.isAdmin, content_controller_1.bulkUpdateSettings);
router.post("/bulk", auth_middleware_1.isAdmin, upload_1.upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), content_controller_1.bulkUpdateSettings); // FormData with file uploads
router.get("/group/:group", content_controller_1.getSettingsByGroup);
router.get("/settings", content_controller_1.getSettings);
router.get("/active-popup", content_controller_1.getActivePopup);
router.get("/footer-links", content_controller_1.getFooterLinks);
exports.default = router;
