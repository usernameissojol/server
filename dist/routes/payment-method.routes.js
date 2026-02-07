"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_method_controller_1 = require("../controllers/payment-method.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/", payment_method_controller_1.getPaymentMethods);
router.post("/", auth_middleware_1.isAdmin, payment_method_controller_1.createPaymentMethod);
router.post("/:id", auth_middleware_1.isAdmin, payment_method_controller_1.updatePaymentMethod); // Support for both PUT and POST for update
router.put("/:id", auth_middleware_1.isAdmin, payment_method_controller_1.updatePaymentMethod);
router.delete("/:id", auth_middleware_1.isAdmin, payment_method_controller_1.deletePaymentMethod);
exports.default = router;
