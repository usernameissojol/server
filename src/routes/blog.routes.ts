import express from "express";
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, getBlogStats, getBlogCategories } from "../controllers/blog.controller";

const router = express.Router();

router.get("/stats", getBlogStats);
router.get("/categories", getBlogCategories);

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", createBlog);
router.post("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
