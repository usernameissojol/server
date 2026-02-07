"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ecourier_controller_1 = require("../controllers/ecourier.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Order Management
router.post("/orders", auth_middleware_1.isAdmin, ecourier_controller_1.placeOrder);
router.post("/orders/cancel", auth_middleware_1.isAdmin, ecourier_controller_1.cancelOrder);
router.post("/tracking", auth_middleware_1.isAdmin, ecourier_controller_1.trackParcel);
router.post("/fraud-check", auth_middleware_1.isAdmin, ecourier_controller_1.checkFraudParams);
router.post("/payment-status", auth_middleware_1.isAdmin, ecourier_controller_1.getPaymentStatus);
// Location Data
router.post("/cities", ecourier_controller_1.getCityList);
router.post("/thanas", ecourier_controller_1.getThanaList);
router.post("/areas", ecourier_controller_1.getAreaList);
router.post("/postcodes", ecourier_controller_1.getPostCodeList);
exports.default = router;
