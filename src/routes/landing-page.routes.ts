import { Router } from "express";
import {
    getLandingPages,
    getLandingPageByParam,
    createLandingPage,
    updateLandingPage,
    deleteLandingPage,
    getTemplates
} from "../controllers/landing-page.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getLandingPages);
router.get("/:id", getLandingPageByParam);
router.post("/", isAdmin, createLandingPage);
router.post("/:id", isAdmin, updateLandingPage);
router.delete("/:id", isAdmin, deleteLandingPage);

export default router;
