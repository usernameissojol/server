"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Retrieve profile
router.get("/profile", auth_middleware_1.authenticate, user_controller_1.getProfile);
// Update profile details
router.post("/profile", auth_middleware_1.authenticate, user_controller_1.updateProfile);
// Upload profile image
router.post("/profile/image", auth_middleware_1.authenticate, upload_1.upload.single("image"), user_controller_1.uploadProfileImage);
// Get user orders
router.get("/orders", auth_middleware_1.authenticate, user_controller_1.getOrders);
// Change password
router.post("/update-password", auth_middleware_1.authenticate, user_controller_1.updatePassword);
exports.default = router;
