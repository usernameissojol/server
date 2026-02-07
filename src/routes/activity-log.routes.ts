import { Router } from "express";
import { getActivityLogs, clearActivityLogs } from "../controllers/activity-log.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAdmin, getActivityLogs);
router.delete("/", isAdmin, clearActivityLogs);

export default router;
