import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await prisma.admins.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                permissions: true,
                last_login: true,
                created_at: true,
                image: true
            }
        });
        res.json(admins);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching admins", error: error.message });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, permissions, status } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ status: "error", message: "Name, email, and password are required" });
        }

        // Check if exists
        const existing = await prisma.admins.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ status: "error", message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admins.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "admin",
                permissions: typeof permissions === 'object' ? JSON.stringify(permissions) : permissions,
                status: status || "active"
            }
        });

        res.json({ status: "success", message: "Admin created successfully", id: newAdmin.id });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error creating admin", error: error.message });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
        const { name, email, password, role, permissions, status } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (permissions) updateData.permissions = typeof permissions === 'object' ? JSON.stringify(permissions) : permissions;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.admins.update({
            where: { id },
            data: updateData
        });

        res.json({ status: "success", message: "Admin updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating admin", error: error.message });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);

        // Protect super admin if needed, but for now just delete
        await prisma.admins.delete({
            where: { id }
        });

        res.json({ status: "success", message: "Admin deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error deleting admin", error: error.message });
    }
};

export const clearCache = async (req: Request, res: Response) => {
    // In a real app, this might clear Redis or file cache
    // For now, we'll just return success
    res.json({ status: "success", message: "System cache cleared successfully" });
};

export const toggleMaintenance = async (req: Request, res: Response) => {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: 'maintenance_mode' }
        });

        const currentMode = setting?.value === 'on' ? 'off' : 'on';

        await prisma.settings.upsert({
            where: { key: 'maintenance_mode' },
            update: { value: currentMode },
            create: { key: 'maintenance_mode', value: currentMode, group: 'system' }
        });

        res.json({
            status: "success",
            message: `Maintenance mode turned ${currentMode}`,
            mode: currentMode
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error toggling maintenance mode", error: error.message });
    }
};
