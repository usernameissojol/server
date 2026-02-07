import express from "express";
import { getTransactions, getTransactionById, createTransaction, deleteTransaction } from "../controllers/transaction.controller";

const router = express.Router();

router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
