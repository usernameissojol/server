import express from "express";
import { getTutorials, createTutorial, updateTutorial, deleteTutorial } from "../controllers/tutorial.controller";

const router = express.Router();

router.get("/", getTutorials);
router.post("/", createTutorial);
router.put("/:id", updateTutorial);
router.delete("/:id", deleteTutorial);

export default router;
