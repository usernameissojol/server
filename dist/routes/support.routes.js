"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const support_controller_1 = require("../controllers/support.controller");
const router = express_1.default.Router();
router.get("/", support_controller_1.getTickets);
router.get("/active", support_controller_1.getActiveTicket);
router.post("/", support_controller_1.createTicket);
router.get("/:id", support_controller_1.getTicketById);
router.post("/:id/reply", support_controller_1.replyTicket);
router.post("/:id/customer-reply", support_controller_1.replyTicketFromCustomer);
router.put("/:id/status", support_controller_1.updateTicketStatus);
router.delete("/:id", support_controller_1.deleteTicket);
exports.default = router;
