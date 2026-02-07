"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const seo_controller_1 = require("../controllers/seo.controller");
const router = express_1.default.Router();
router.get("/robots", seo_controller_1.getRobotsTxt);
router.post("/robots", seo_controller_1.updateRobotsTxt);
router.get("/sitemap/generate", seo_controller_1.generateSitemap);
exports.default = router;
