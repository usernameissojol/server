"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carousel_controller_1 = require("../controllers/carousel.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/admin", auth_middleware_1.isAdmin, carousel_controller_1.getAllCarouselsAdmin); // Get all carousels for admin
router.get("/", carousel_controller_1.getCarousels); // Get active carousels for frontend
router.post("/", auth_middleware_1.isAdmin, upload_1.upload.single("image"), carousel_controller_1.createCarousel);
router.post("/:id", auth_middleware_1.isAdmin, upload_1.upload.single("image"), carousel_controller_1.updateCarousel); // For multipart updates
router.put("/:id", auth_middleware_1.isAdmin, upload_1.upload.single("image"), carousel_controller_1.updateCarousel);
router.delete("/:id", auth_middleware_1.isAdmin, carousel_controller_1.deleteCarousel);
exports.default = router;
