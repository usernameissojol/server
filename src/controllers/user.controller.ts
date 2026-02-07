import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let user;
        if (role === 'customer') {
            user = await prisma.users.findUnique({ where: { id: userId } });
        } else {
            user = await prisma.admins.findUnique({ where: { id: userId } });
        }

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({ status: "success", user: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching profile", error: error.message });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const data = req.body;

        if (role === 'customer') {
            await prisma.users.update({
                where: { id: userId },
                data: {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address
                }
            });
        } else {
            await prisma.admins.update({
                where: { id: userId },
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address
                }
            });
        }

        res.json({ status: "success", message: "Profile updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating profile", error: error.message });
    }
};

export const uploadProfileImage = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No image uploaded" });
        }

        const userId = req.user.id;
        const role = req.user.role;
        const imagePath = `uploads/profile/${req.file.filename}`;

        if (role === 'customer') {
            await prisma.users.update({
                where: { id: userId },
                data: { image: imagePath }
            });
        } else {
            await prisma.admins.update({
                where: { id: userId },
                data: { image: imagePath }
            });
        }

        res.json({ status: "success", message: "Image uploaded successfully", image: imagePath });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error uploading image", error: error.message });
    }
};

export const updatePassword = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: "error", message: "Current and new password are required" });
        }

        let user;
        if (role === 'customer') {
            user = await prisma.users.findUnique({ where: { id: userId } });
        } else {
            user = await prisma.admins.findUnique({ where: { id: userId } });
        }

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "error", message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (role === 'customer') {
            await prisma.users.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
        } else {
            await prisma.admins.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
        }

        res.json({ status: "success", message: "Password updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating password", error: error.message });
    }
};

export const getOrders = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        // Mock orders for now or implement real logic
        res.json([]);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching orders", error: error.message });
    }
};
