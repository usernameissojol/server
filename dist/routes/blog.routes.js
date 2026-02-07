"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_controller_1 = require("../controllers/blog.controller");
const router = express_1.default.Router();
router.get("/stats", blog_controller_1.getBlogStats);
router.get("/categories", blog_controller_1.getBlogCategories);
router.get("/", blog_controller_1.getBlogs);
router.get("/:id", blog_controller_1.getBlogById);
router.post("/", blog_controller_1.createBlog);
router.post("/:id", blog_controller_1.updateBlog);
router.delete("/:id", blog_controller_1.deleteBlog);
exports.default = router;
