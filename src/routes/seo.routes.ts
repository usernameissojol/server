import express from "express";
import { getRobotsTxt, updateRobotsTxt, generateSitemap } from "../controllers/seo.controller";

const router = express.Router();

router.get("/robots", getRobotsTxt);
router.post("/robots", updateRobotsTxt);
router.get("/sitemap/generate", generateSitemap);

export default router;
