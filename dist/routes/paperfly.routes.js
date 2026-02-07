"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paperfly_controller_1 = require("../controllers/paperfly.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/orders", auth_middleware_1.isAdmin, paperfly_controller_1.createOrder);
router.post("/orders/cancel/:referenceNumber", auth_middleware_1.isAdmin, paperfly_controller_1.cancelOrder);
router.get("/orders/:referenceNumber", auth_middleware_1.isAdmin, paperfly_controller_1.getOrderDetails);
router.get("/tracking/:trackingNumber", auth_middleware_1.isAdmin, paperfly_controller_1.trackOrder);
exports.default = router;
