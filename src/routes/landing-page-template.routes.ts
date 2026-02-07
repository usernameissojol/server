import { Router } from "express";
import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
} from "../controllers/landing-page.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getTemplates);
router.get("/:id", getTemplates);
router.post("/", isAdmin, createTemplate);
router.put("/:id", isAdmin, updateTemplate);
router.delete("/:id", isAdmin, deleteTemplate);

export default router;
