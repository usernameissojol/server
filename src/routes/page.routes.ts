import { Router } from "express";
import { getPages, getPageBySlug, createPage, updatePage, deletePage } from "../controllers/page.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getPages);
router.get("/:slug", getPageBySlug);
router.post("/", isAdmin, createPage);
router.post("/:id", isAdmin, updatePage);
router.delete("/:id", isAdmin, deletePage);

export default router;
