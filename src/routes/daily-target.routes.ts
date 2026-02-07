import { Router } from "express";
import { getDailyTargetStats, updateDailyTargets } from "../controllers/daily-target.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAdmin, getDailyTargetStats);
router.post("/", isAdmin, updateDailyTargets);

export default router;
