"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicketStatus = exports.replyTicketFromCustomer = exports.replyTicket = exports.getTicketById = exports.createTicket = exports.getActiveTicket = exports.getTickets = void 0;
const prisma_1 = require("../lib/prisma");
// Get All Tickets
const getTickets = async (req, res) => {
    try {
        const tickets = await prisma_1.prisma.support_tickets.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                ticket_replies: true
            }
        });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching tickets", error: error.message });
    }
};
exports.getTickets = getTickets;
// Get Active Ticket for Customer
const getActiveTicket = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ status: "error", message: "Email is required" });
        }
        const ticket = await prisma_1.prisma.support_tickets.findFirst({
            where: {
                guest_email: email,
                status: {
                    in: ['Open', 'Pending']
                }
            },
            include: {
                ticket_replies: {
                    orderBy: { created_at: 'asc' }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        if (!ticket) {
            return res.status(404).json({ status: "error", message: "No active ticket found" });
        }
        res.json({
            status: "success",
            ticket: {
                ...ticket,
                replies: ticket.ticket_replies
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching active ticket", error: error.message });
    }
};
exports.getActiveTicket = getActiveTicket;
// Create Ticket (New Chat Session)
const createTicket = async (req, res) => {
    try {
        const { subject, message, name, email, priority } = req.body;
        const ticket = await prisma_1.prisma.support_tickets.create({
            data: {
                subject: subject || "Live Chat Support",
                message: message,
                guest_name: name,
                guest_email: email,
                priority: priority || "Medium",
                status: "Open"
            }
        });
        res.status(201).json({ status: "success", message: "Ticket created", id: ticket.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating ticket", error: error.message });
    }
};
exports.createTicket = createTicket;
// Get Ticket By ID
const getTicketById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ticket ID" });
        }
        const ticket = await prisma_1.prisma.support_tickets.findUnique({
            where: { id },
            include: { ticket_replies: { orderBy: { created_at: 'asc' } } }
        });
        if (!ticket) {
            return res.status(404).json({ status: "error", message: "Ticket not found" });
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching ticket", error: error.message });
    }
};
exports.getTicketById = getTicketById;
// Reply to Ticket (Admin)
const replyTicket = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { message } = req.body;
        if (isNaN(id))
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        const reply = await prisma_1.prisma.ticket_replies.create({
            data: {
                ticket_id: id,
                message,
                is_admin: true,
                user_id: 1 // Admin session ID normally
            }
        });
        await prisma_1.prisma.support_tickets.update({
            where: { id },
            data: {
                last_reply_at: new Date(),
                status: 'Pending'
            }
        });
        res.json(reply);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error replying to ticket", error: error.message });
    }
};
exports.replyTicket = replyTicket;
// Reply to Ticket (Customer)
const replyTicketFromCustomer = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { message } = req.body;
        if (isNaN(id))
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        const reply = await prisma_1.prisma.ticket_replies.create({
            data: {
                ticket_id: id,
                message,
                is_admin: false
            }
        });
        await prisma_1.prisma.support_tickets.update({
            where: { id },
            data: {
                last_reply_at: new Date(),
                status: 'Open' // Marked back to Open when customer replies
            }
        });
        res.json({ status: "success", reply });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error replying to ticket", error: error.message });
    }
};
exports.replyTicketFromCustomer = replyTicketFromCustomer;
// Update Status
const updateTicketStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(id))
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        const ticket = await prisma_1.prisma.support_tickets.update({
            where: { id },
            data: { status }
        });
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating ticket status", error: error.message });
    }
};
exports.updateTicketStatus = updateTicketStatus;
// Delete Ticket
const deleteTicket = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ status: "error", message: "Invalid ID" });
        await prisma_1.prisma.support_tickets.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Ticket deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting ticket", error: error.message });
    }
};
exports.deleteTicket = deleteTicket;
