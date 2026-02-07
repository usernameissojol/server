import { Router } from "express";
import {
    getIncomeCategories,
    createIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory
} from "../controllers/revenue.controller";
import { isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAdmin, getIncomeCategories);
router.post("/", isAdmin, createIncomeCategory);
router.post("/:id", isAdmin, updateIncomeCategory); // POST with _method=PUT from client
router.delete("/:id", isAdmin, deleteIncomeCategory);

export default router;
