import { Router } from "express";
import {
    getTags, createTag, updateTag, deleteTag, bulkDeleteTags,
    getAttributes, createAttribute, updateAttribute, deleteAttribute, bulkDeleteAttributes
} from "../controllers/taxonomy.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

// Tags
router.get("/tags", getTags);
router.post("/tags", isAdmin, createTag);
router.post("/tags/bulk-delete", isAdmin, bulkDeleteTags);
router.post("/tags/:id", isAdmin, updateTag);
router.delete("/tags/:id", isAdmin, deleteTag);

// Attributes
router.get("/attributes", getAttributes);
router.post("/attributes", isAdmin, createAttribute);
router.post("/attributes/bulk-delete", isAdmin, bulkDeleteAttributes);
router.post("/attributes/:id", isAdmin, updateAttribute);
router.delete("/attributes/:id", isAdmin, deleteAttribute);

export default router;
