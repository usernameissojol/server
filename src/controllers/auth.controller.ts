import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";

export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "error", message: "Email and password required" });
    }

    try {
        const admin = await prisma.admins.findFirst({
            where: { email },
        });

        if (!admin) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        if (admin.status !== "active") {
            return res.status(403).json({ status: "error", message: "Admin account is not active" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Remove password from object
        const { password: _, ...adminWithoutPassword } = admin;

        // Parse permissions if they are a string
        let parsedPermissions: any = adminWithoutPassword.permissions;
        if (typeof parsedPermissions === "string") {
            try {
                parsedPermissions = JSON.parse(parsedPermissions);
            } catch (e) {
                parsedPermissions = [];
            }
        }

        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: { ...adminWithoutPassword, permissions: parsedPermissions },
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};

export const userLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "error", message: "Email and password required" });
    }

    try {
        const user = await prisma.users.findFirst({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: "customer" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            status: "success",
            message: "Login successful",
            token,
            user: userWithoutPassword,
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};

export const userRegister = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ status: "error", message: "Name, Email, and Password required" });
    }

    try {
        const existingUser = await prisma.users.findFirst({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ status: "error", message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
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
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Server error", error: error.message });
    }
};
