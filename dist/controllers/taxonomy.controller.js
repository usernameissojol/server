"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteAttributes = exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = exports.bulkDeleteTags = exports.deleteTag = exports.updateTag = exports.createTag = exports.getAttributes = exports.getTags = void 0;
const prisma_1 = require("../lib/prisma");
const getTags = async (req, res) => {
    try {
        const tags = await prisma_1.prisma.tags.findMany();
        res.json(tags);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching tags", error: error.message });
    }
};
exports.getTags = getTags;
const getAttributes = async (req, res) => {
    try {
        const attributes = await prisma_1.prisma.attributes.findMany();
        const parsed = attributes.map(attr => {
            let values = [];
            try {
                if (attr.values) {
                    values = JSON.parse(attr.values);
                }
            }
            catch (e) {
                // If parse fails, handle as fallback (e.g. if it was a simple string)
                values = attr.values ? [attr.values] : [];
            }
            return {
                ...attr,
                values: Array.isArray(values) ? values : []
            };
        });
        res.json(parsed);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching attributes", error: error.message });
    }
};
exports.getAttributes = getAttributes;
const createTag = async (req, res) => {
    try {
        const data = req.body;
        const tag = await prisma_1.prisma.tags.create({
            data: {
                name: data.name,
                slug: data.slug,
                color: data.color,
                status: data.status || 'publish'
            }
        });
        res.json({ status: "success", message: "Tag created successfully", id: tag.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating tag", error: error.message });
    }
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.tags.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                color: data.color,
                status: data.status
            }
        });
        res.json({ status: "success", message: "Tag updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating tag", error: error.message });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.tags.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Tag deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting tag", error: error.message });
    }
};
exports.deleteTag = deleteTag;
const bulkDeleteTags = async (req, res) => {
    try {
        const { ids } = req.body;
        await prisma_1.prisma.tags.deleteMany({
            where: { id: { in: ids.map((id) => parseInt(id)) } }
        });
        res.json({ status: "success", message: "Tags deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
exports.bulkDeleteTags = bulkDeleteTags;
// Attributes
const createAttribute = async (req, res) => {
    try {
        const data = req.body;
        const attribute = await prisma_1.prisma.attributes.create({
            data: {
                name: data.name,
                slug: data.slug,
                type: data.type || 'Dropdown',
                values: typeof data.values === 'string' ? data.values : JSON.stringify(data.values),
                status: data.status || 'publish',
                icon: data.icon
            }
        });
        res.json({ status: "success", message: "Attribute created successfully", id: attribute.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating attribute", error: error.message });
    }
};
exports.createAttribute = createAttribute;
const updateAttribute = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.attributes.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                type: data.type,
                values: typeof data.values === 'string' ? data.values : JSON.stringify(data.values),
                status: data.status,
                icon: data.icon
            }
        });
        res.json({ status: "success", message: "Attribute updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating attribute", error: error.message });
    }
};
exports.updateAttribute = updateAttribute;
const deleteAttribute = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.prisma.attributes.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Attribute deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting attribute", error: error.message });
    }
};
exports.deleteAttribute = deleteAttribute;
const bulkDeleteAttributes = async (req, res) => {
    try {
        const { ids } = req.body;
        await prisma_1.prisma.attributes.deleteMany({
            where: { id: { in: ids.map((id) => parseInt(id)) } }
        });
        res.json({ status: "success", message: "Attributes deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error performing bulk delete", error: error.message });
    }
};
exports.bulkDeleteAttributes = bulkDeleteAttributes;
