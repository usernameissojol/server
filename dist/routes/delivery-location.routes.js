"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_location_controller_1 = require("../controllers/delivery-location.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/", delivery_location_controller_1.getDeliveryLocations);
router.post("/", auth_middleware_1.isAdmin, delivery_location_controller_1.createDeliveryLocation);
router.put("/:id", auth_middleware_1.isAdmin, delivery_location_controller_1.updateDeliveryLocation);
router.post("/:id", auth_middleware_1.isAdmin, delivery_location_controller_1.updateDeliveryLocation);
router.delete("/:id", auth_middleware_1.isAdmin, delivery_location_controller_1.deleteDeliveryLocation);
exports.default = router;
