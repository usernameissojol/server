"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fraud_check_controller_1 = require("../controllers/fraud-check.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/blacklist", auth_middleware_1.isAdmin, fraud_check_controller_1.getBlacklist);
router.post("/blacklist", auth_middleware_1.isAdmin, fraud_check_controller_1.addToBlacklist);
router.delete("/blacklist/:id", auth_middleware_1.isAdmin, fraud_check_controller_1.removeFromBlacklist);
router.post("/check", fraud_check_controller_1.checkFraud);
router.get("/check-user", auth_middleware_1.isAdmin, fraud_check_controller_1.checkFraudUser);
router.get("/check/:id", auth_middleware_1.isAdmin, fraud_check_controller_1.checkFraudById);
exports.default = router;
