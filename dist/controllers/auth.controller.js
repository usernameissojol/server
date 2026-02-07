"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegister = exports.userLogin = exports.adminLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: "error", message: "Email and password required" });
    }
    try {
        const admin = await prisma_1.prisma.admins.findFirst({
            where: { email },
        });
        if (!admin) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }
        if (admin.status !== "active") {
            return res.status(403).json({ status: "error", message: "Admin account is not active" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: "24h" });
        // Remove password from object
        const { password: _, ...adminWithoutPassword } = admin;
        // Parse permissions if they are a string
        let parsedPermissions = adminWithoutPassword.permissions;
        if (typeof parsedPermissions === "string") {
            try {
                parsedPermissions = JSON.parse(parsedPermissions);
            }
            catch (e) {
                parsedPermissions = [];
            }
        }
        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: { ...adminWithoutPassword, permissions: parsedPermissions },
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};
exports.adminLogin = adminLogin;
const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: "error", message: "Email and password required" });
    }
    try {
        const user = await prisma_1.prisma.users.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};
exports.userLogin = userLogin;
const userRegister = async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ status: "error", message: "Name, Email, and Password required" });
    }
    try {
        const existingUser = await prisma_1.prisma.users.findFirst({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "Email already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
            },
        });
        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};
exports.userRegister = userRegister;
