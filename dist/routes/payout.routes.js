"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payout_controller_1 = require("../controllers/payout.controller");
const router = express_1.default.Router();
// Stats must come before generic :id
router.get("/stats", payout_controller_1.getPayoutStats);
// Methods
router.get("/methods", payout_controller_1.getPayoutMethods);
router.post("/methods", payout_controller_1.createPayoutMethod);
router.delete("/methods/:id", payout_controller_1.deletePayoutMethod);
// Payouts
router.get("/", payout_controller_1.getPayouts);
router.post("/", payout_controller_1.createPayout);
router.post("/:id", payout_controller_1.updatePayoutStatus); // Use POST for status update action if preferred over PUT
exports.default = router;
