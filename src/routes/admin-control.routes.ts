import express from "express";
import {
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    clearCache,
    toggleMaintenance
} from "../controllers/admin-control.controller";

const router = express.Router();

router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.post("/admins/:id", updateAdmin); // Matching frontend service calling .post for update
router.delete("/admins/:id", deleteAdmin);
router.post("/cache/clear", clearCache);
router.post("/maintenance/toggle", toggleMaintenance);

export default router;
