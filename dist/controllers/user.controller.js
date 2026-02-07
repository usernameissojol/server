"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.updatePassword = exports.uploadProfileImage = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let user;
        if (role === 'customer') {
            user = await prisma_1.prisma.users.findUnique({ where: { id: userId } });
        }
        else {
            user = await prisma_1.prisma.admins.findUnique({ where: { id: userId } });
        }
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ status: "success", user: userWithoutPassword });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching profile", error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const data = req.body;
        if (role === 'customer') {
            await prisma_1.prisma.users.update({
                where: { id: userId },
                data: {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address
                }
            });
        }
        else {
            await prisma_1.prisma.admins.update({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating profile", error: error.message });
    }
};
exports.updateProfile = updateProfile;
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No image uploaded" });
        }
        const userId = req.user.id;
        const role = req.user.role;
        const imagePath = `uploads/profile/${req.file.filename}`;
        if (role === 'customer') {
            await prisma_1.prisma.users.update({
                where: { id: userId },
                data: { image: imagePath }
            });
        }
        else {
            await prisma_1.prisma.admins.update({
                where: { id: userId },
                data: { image: imagePath }
            });
        }
        res.json({ status: "success", message: "Image uploaded successfully", image: imagePath });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error uploading image", error: error.message });
    }
};
exports.uploadProfileImage = uploadProfileImage;
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: "error", message: "Current and new password are required" });
        }
        let user;
        if (role === 'customer') {
            user = await prisma_1.prisma.users.findUnique({ where: { id: userId } });
        }
        else {
            user = await prisma_1.prisma.admins.findUnique({ where: { id: userId } });
        }
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "error", message: "Incorrect current password" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        if (role === 'customer') {
            await prisma_1.prisma.users.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
        }
        else {
            await prisma_1.prisma.admins.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
        }
        res.json({ status: "success", message: "Password updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating password", error: error.message });
    }
};
exports.updatePassword = updatePassword;
const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        // Mock orders for now or implement real logic
        res.json([]);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching orders", error: error.message });
    }
};
exports.getOrders = getOrders;
