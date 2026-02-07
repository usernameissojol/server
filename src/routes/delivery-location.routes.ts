import express from "express";
import {
    getDeliveryLocations,
    createDeliveryLocation,
    updateDeliveryLocation,
    deleteDeliveryLocation
} from "../controllers/delivery-location.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getDeliveryLocations);
router.post("/", isAdmin, createDeliveryLocation);
router.put("/:id", isAdmin, updateDeliveryLocation);
router.post("/:id", isAdmin, updateDeliveryLocation);
router.delete("/:id", isAdmin, deleteDeliveryLocation);

export default router;
