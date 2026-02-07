"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFooterLink = exports.updateFooterLink = exports.createFooterLink = exports.getFooterLinks = void 0;
const prisma_1 = require("../lib/prisma");
const getFooterLinks = async (req, res) => {
    try {
        const links = await prisma_1.prisma.footer_links.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(links);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching footer links", error: error.message });
    }
};
exports.getFooterLinks = getFooterLinks;
const createFooterLink = async (req, res) => {
    try {
        const data = req.body;
        const link = await prisma_1.prisma.footer_links.create({
            data: {
                section: data.section,
                title: data.title,
                url: data.url,
                order: parseInt(data.order) || 0,
                status: data.status || 'active'
            }
        });
        res.status(201).json({ status: "success", message: "Link created", id: link.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating link", error: error.message });
    }
};
exports.createFooterLink = createFooterLink;
const updateFooterLink = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await prisma_1.prisma.footer_links.update({
            where: { id: parseInt(id) },
            data: {
                section: data.section,
                title: data.title,
                url: data.url,
                order: data.order !== undefined ? parseInt(data.order) : undefined,
                status: data.status
            }
        });
        res.json({ status: "success", message: "Link updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating link", error: error.message });
    }
};
exports.updateFooterLink = updateFooterLink;
const deleteFooterLink = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.footer_links.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Link deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting link", error: error.message });
    }
};
exports.deleteFooterLink = deleteFooterLink;
