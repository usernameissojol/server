import express from "express";
import {
    getTickets,
    getActiveTicket,
    createTicket,
    getTicketById,
    replyTicket,
    replyTicketFromCustomer,
    updateTicketStatus,
    deleteTicket
} from "../controllers/support.controller";

const router = express.Router();

router.get("/", getTickets);
router.get("/active", getActiveTicket);
router.post("/", createTicket);
router.get("/:id", getTicketById);
router.post("/:id/reply", replyTicket);
router.post("/:id/customer-reply", replyTicketFromCustomer);
router.put("/:id/status", updateTicketStatus);
router.delete("/:id", deleteTicket);

export default router;
