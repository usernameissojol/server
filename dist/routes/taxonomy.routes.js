"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taxonomy_controller_1 = require("../controllers/taxonomy.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Tags
router.get("/tags", taxonomy_controller_1.getTags);
router.post("/tags", auth_middleware_1.isAdmin, taxonomy_controller_1.createTag);
router.post("/tags/bulk-delete", auth_middleware_1.isAdmin, taxonomy_controller_1.bulkDeleteTags);
router.post("/tags/:id", auth_middleware_1.isAdmin, taxonomy_controller_1.updateTag);
router.delete("/tags/:id", auth_middleware_1.isAdmin, taxonomy_controller_1.deleteTag);
// Attributes
router.get("/attributes", taxonomy_controller_1.getAttributes);
router.post("/attributes", auth_middleware_1.isAdmin, taxonomy_controller_1.createAttribute);
router.post("/attributes/bulk-delete", auth_middleware_1.isAdmin, taxonomy_controller_1.bulkDeleteAttributes);
router.post("/attributes/:id", auth_middleware_1.isAdmin, taxonomy_controller_1.updateAttribute);
router.delete("/attributes/:id", auth_middleware_1.isAdmin, taxonomy_controller_1.deleteAttribute);
exports.default = router;
