import express from "express";
import {
    getCities,
    getZones,
    getAreas,
    getStores,
    createStore,
    createOrder,
    calculatePrice,
    issueToken
} from "../controllers/pathao.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/cities", getCities);
router.get("/zones/:city_id", getZones);
router.get("/areas/:zone_id", getAreas);

router.get("/stores", isAdmin, getStores);
router.post("/stores", isAdmin, createStore);

router.post("/orders", isAdmin, createOrder);
router.post("/price-calculation", isAdmin, calculatePrice);

// Helper to manually get token if needed
router.post("/issue-token", isAdmin, issueToken);

export default router;
