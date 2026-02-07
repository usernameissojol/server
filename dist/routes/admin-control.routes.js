"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_control_controller_1 = require("../controllers/admin-control.controller");
const router = express_1.default.Router();
router.get("/admins", admin_control_controller_1.getAdmins);
router.post("/admins", admin_control_controller_1.createAdmin);
router.post("/admins/:id", admin_control_controller_1.updateAdmin); // Matching frontend service calling .post for update
router.delete("/admins/:id", admin_control_controller_1.deleteAdmin);
router.post("/cache/clear", admin_control_controller_1.clearCache);
router.post("/maintenance/toggle", admin_control_controller_1.toggleMaintenance);
exports.default = router;
