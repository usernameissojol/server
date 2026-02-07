import express from "express";
import {
    getAreas,
    getStores,
    createStore,
    getStoreDetails,
    createParcel,
    getParcelDetails,
    trackParcel
} from "../controllers/redx.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// Areas
router.get("/areas", getAreas);

// Stores
router.get("/stores", isAdmin, getStores);
router.post("/stores", isAdmin, createStore);
router.get("/stores/:id", isAdmin, getStoreDetails);

// Parcels
router.post("/parcels", isAdmin, createParcel);
router.get("/parcels/:trackingId", isAdmin, getParcelDetails);
router.get("/parcels/:trackingId/tracking", isAdmin, trackParcel);

export default router;
