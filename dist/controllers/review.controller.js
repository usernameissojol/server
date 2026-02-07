"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getProductReviews = exports.updateReview = exports.updateReviewStatus = exports.getReviewById = exports.getReviews = void 0;
const prisma_1 = require("../lib/prisma");
const getReviews = async (req, res) => {
    try {
        const reviews = await prisma_1.prisma.reviews.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching reviews", error: error.message });
    }
};
exports.getReviews = getReviews;
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await prisma_1.prisma.reviews.findUnique({
            where: { id: parseInt(id) },
            include: {
                products: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                users: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });
        if (!review) {
            return res.status(404).json({ status: "error", message: "Review not found" });
        }
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching review", error: error.message });
    }
};
exports.getReviewById = getReviewById;
const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await prisma_1.prisma.reviews.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json({ status: "success", message: "Review status updated" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating review", error: error.message });
    }
};
exports.updateReviewStatus = updateReviewStatus;
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = {};
        if (data.rating !== undefined)
            updateData.rating = parseInt(data.rating);
        if (data.comment !== undefined)
            updateData.comment = data.comment;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.guest_name !== undefined)
            updateData.guest_name = data.guest_name;
        await prisma_1.prisma.reviews.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ status: "success", message: "Review updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating review", error: error.message });
    }
};
exports.updateReview = updateReview;
const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await prisma_1.prisma.reviews.findMany({
            where: {
                product_id: parseInt(id),
                status: 'approved'
            },
            include: {
                users: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching product reviews", error: error.message });
    }
};
exports.getProductReviews = getProductReviews;
const createReview = async (req, res) => {
    try {
        const data = req.body;
        // Basic validation
        if (!data.product_id || !data.rating) {
            return res.status(400).json({ status: "error", message: "Product ID and Rating are required" });
        }
        const review = await prisma_1.prisma.reviews.create({
            data: {
                product_id: parseInt(data.product_id),
                user_id: data.user_id ? parseInt(data.user_id) : null,
                guest_name: data.guest_name,
                rating: parseInt(data.rating),
                comment: data.comment,
                status: 'pending' // Default to pending
            }
        });
        res.json({ status: "success", message: "Review submitted for approval", review });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating review", error: error.message });
    }
};
exports.createReview = createReview;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.reviews.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Review deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting review", error: error.message });
    }
};
exports.deleteReview = deleteReview;
