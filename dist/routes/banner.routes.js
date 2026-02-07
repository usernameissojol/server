"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/admin", auth_middleware_1.isAdmin, banner_controller_1.getAllBannersAdmin); // Get all banners for admin
router.get("/", banner_controller_1.getBanners); // Get active banners for frontend
router.post("/", auth_middleware_1.isAdmin, upload_1.upload.single("image"), banner_controller_1.createBanner);
router.post("/:id", auth_middleware_1.isAdmin, upload_1.upload.single("image"), banner_controller_1.updateBanner); // For multipart updates
router.put("/:id", auth_middleware_1.isAdmin, upload_1.upload.single("image"), banner_controller_1.updateBanner);
router.delete("/:id", auth_middleware_1.isAdmin, banner_controller_1.deleteBanner);
exports.default = router;
