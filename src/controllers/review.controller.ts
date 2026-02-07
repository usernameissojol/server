import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await prisma.reviews.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching reviews", error: error.message });
    }
};

export const getReviewById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const review = await prisma.reviews.findUnique({
            where: { id: parseInt(id as string) },
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching review", error: error.message });
    }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await prisma.reviews.update({
            where: { id: parseInt(id as string) },
            data: { status }
        });
        res.json({ status: "success", message: "Review status updated" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating review", error: error.message });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updateData: any = {};
        if (data.rating !== undefined) updateData.rating = parseInt(data.rating as string);
        if (data.comment !== undefined) updateData.comment = data.comment;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.guest_name !== undefined) updateData.guest_name = data.guest_name;

        await prisma.reviews.update({
            where: { id: parseInt(id as string) },
            data: updateData
        });
        res.json({ status: "success", message: "Review updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating review", error: error.message });
    }
};

export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reviews = await prisma.reviews.findMany({
            where: {
                product_id: parseInt(id as string),
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching product reviews", error: error.message });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // Basic validation
        if (!data.product_id || !data.rating) {
            return res.status(400).json({ status: "error", message: "Product ID and Rating are required" });
        }

        const review = await prisma.reviews.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating review", error: error.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.reviews.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ status: "success", message: "Review deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting review", error: error.message });
    }
};
