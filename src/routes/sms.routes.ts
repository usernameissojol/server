import express from "express";
import { testSMS } from "../controllers/sms.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/test-sms", isAdmin, testSMS);

export default router;
