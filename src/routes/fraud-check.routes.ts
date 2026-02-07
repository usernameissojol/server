import express from "express";
import { getBlacklist, addToBlacklist, removeFromBlacklist, checkFraud, checkFraudUser, checkFraudById } from "../controllers/fraud-check.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/blacklist", isAdmin, getBlacklist);
router.post("/blacklist", isAdmin, addToBlacklist);
router.delete("/blacklist/:id", isAdmin, removeFromBlacklist);
router.post("/check", checkFraud);
router.get("/check-user", isAdmin, checkFraudUser);
router.get("/check/:id", isAdmin, checkFraudById);

export default router;
