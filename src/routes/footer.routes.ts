import { Router } from "express";
import { getFooterLinks, createFooterLink, updateFooterLink, deleteFooterLink } from "../controllers/footer.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getFooterLinks);
router.post("/", isAdmin, createFooterLink);
router.post("/:id", isAdmin, updateFooterLink);
router.delete("/:id", isAdmin, deleteFooterLink);

export default router;
