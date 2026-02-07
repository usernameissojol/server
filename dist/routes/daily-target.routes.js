"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const daily_target_controller_1 = require("../controllers/daily-target.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.isAdmin, daily_target_controller_1.getDailyTargetStats);
router.post("/", auth_middleware_1.isAdmin, daily_target_controller_1.updateDailyTargets);
exports.default = router;
