"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redx_controller_1 = require("../controllers/redx.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Areas
router.get("/areas", redx_controller_1.getAreas);
// Stores
router.get("/stores", auth_middleware_1.isAdmin, redx_controller_1.getStores);
router.post("/stores", auth_middleware_1.isAdmin, redx_controller_1.createStore);
router.get("/stores/:id", auth_middleware_1.isAdmin, redx_controller_1.getStoreDetails);
// Parcels
router.post("/parcels", auth_middleware_1.isAdmin, redx_controller_1.createParcel);
router.get("/parcels/:trackingId", auth_middleware_1.isAdmin, redx_controller_1.getParcelDetails);
router.get("/parcels/:trackingId/tracking", auth_middleware_1.isAdmin, redx_controller_1.trackParcel);
exports.default = router;
