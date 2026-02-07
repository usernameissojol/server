import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Get All Tickets
export const getTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await prisma.support_tickets.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                ticket_replies: true
            }
        });
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching tickets", error: error.message });
    }
};

// Get Active Ticket for Customer
export const getActiveTicket = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ status: "error", message: "Email is required" });
        }

        const ticket = await prisma.support_tickets.findFirst({
            where: {
                guest_email: email as string,
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching active ticket", error: error.message });
    }
};

// Create Ticket (New Chat Session)
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { subject, message, name, email, priority } = req.body;

        const ticket = await prisma.support_tickets.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating ticket", error: error.message });
    }
};

// Get Ticket By ID
export const getTicketById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ticket ID" });
        }
        const ticket = await prisma.support_tickets.findUnique({
            where: { id },
            include: { ticket_replies: { orderBy: { created_at: 'asc' } } }
        });
        if (!ticket) {
            return res.status(404).json({ status: "error", message: "Ticket not found" });
        }
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching ticket", error: error.message });
    }
};

// Reply to Ticket (Admin)
export const replyTicket = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { message } = req.body;

        if (isNaN(id)) return res.status(400).json({ status: "error", message: "Invalid ID" });

        const reply = await prisma.ticket_replies.create({
            data: {
                ticket_id: id,
                message,
                is_admin: true,
                user_id: 1 // Admin session ID normally
            }
        });

        await prisma.support_tickets.update({
            where: { id },
            data: {
                last_reply_at: new Date(),
                status: 'Pending'
            }
        });

        res.json(reply);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error replying to ticket", error: error.message });
    }
};

// Reply to Ticket (Customer)
export const replyTicketFromCustomer = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { message } = req.body;

        if (isNaN(id)) return res.status(400).json({ status: "error", message: "Invalid ID" });

        const reply = await prisma.ticket_replies.create({
            data: {
                ticket_id: id,
                message,
                is_admin: false
            }
        });

        await prisma.support_tickets.update({
            where: { id },
            data: {
                last_reply_at: new Date(),
                status: 'Open' // Marked back to Open when customer replies
            }
        });

        res.json({ status: "success", reply });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error replying to ticket", error: error.message });
    }
};

// Update Status
export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;

        if (isNaN(id)) return res.status(400).json({ status: "error", message: "Invalid ID" });

        const ticket = await prisma.support_tickets.update({
            where: { id },
            data: { status }
        });

        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating ticket status", error: error.message });
    }
};

// Delete Ticket
export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        if (isNaN(id)) return res.status(400).json({ status: "error", message: "Invalid ID" });

        await prisma.support_tickets.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Ticket deleted" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting ticket", error: error.message });
    }
};
