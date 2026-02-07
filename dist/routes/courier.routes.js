"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courier_controller_1 = require("../controllers/courier.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/create-order", auth_middleware_1.isAdmin, courier_controller_1.createCourierOrder);
router.get("/status/:invoice", auth_middleware_1.isAdmin, courier_controller_1.checkDeliveryStatus);
router.get("/balance", auth_middleware_1.isAdmin, courier_controller_1.getCourierBalance);
exports.default = router;
