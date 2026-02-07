"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_log_controller_1 = require("../controllers/activity-log.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.isAdmin, activity_log_controller_1.getActivityLogs);
router.delete("/", auth_middleware_1.isAdmin, activity_log_controller_1.clearActivityLogs);
exports.default = router;
