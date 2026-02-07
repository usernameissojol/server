"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pathao_controller_1 = require("../controllers/pathao.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/cities", pathao_controller_1.getCities);
router.get("/zones/:city_id", pathao_controller_1.getZones);
router.get("/areas/:zone_id", pathao_controller_1.getAreas);
router.get("/stores", auth_middleware_1.isAdmin, pathao_controller_1.getStores);
router.post("/stores", auth_middleware_1.isAdmin, pathao_controller_1.createStore);
router.post("/orders", auth_middleware_1.isAdmin, pathao_controller_1.createOrder);
router.post("/price-calculation", auth_middleware_1.isAdmin, pathao_controller_1.calculatePrice);
// Helper to manually get token if needed
router.post("/issue-token", auth_middleware_1.isAdmin, pathao_controller_1.issueToken);
exports.default = router;
