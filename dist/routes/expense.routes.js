"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expense_controller_1 = require("../controllers/expense.controller");
const router = express_1.default.Router();
router.get("/", expense_controller_1.getExpenses);
router.post("/", expense_controller_1.createExpense);
router.put("/:id", expense_controller_1.updateExpense);
router.delete("/:id", expense_controller_1.deleteExpense);
router.get("/stats", expense_controller_1.getExpenseStats);
exports.default = router;
