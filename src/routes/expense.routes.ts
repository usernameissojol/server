import express from "express";
import { getExpenses, createExpense, deleteExpense, getExpenseStats, updateExpense } from "../controllers/expense.controller";

const router = express.Router();

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.get("/stats", getExpenseStats);

export default router;
