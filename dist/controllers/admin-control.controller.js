"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMaintenance = exports.clearCache = exports.deleteAdmin = exports.updateAdmin = exports.createAdmin = exports.getAdmins = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getAdmins = async (req, res) => {
    try {
        const admins = await prisma_1.prisma.admins.findMany({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching admins", error: error.message });
    }
};
exports.getAdmins = getAdmins;
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, role, permissions, status } = req.body;
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ status: "error", message: "Name, email, and password are required" });
        }
        // Check if exists
        const existing = await prisma_1.prisma.admins.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ status: "error", message: "Email already in use" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newAdmin = await prisma_1.prisma.admins.create({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating admin", error: error.message });
    }
};
exports.createAdmin = createAdmin;
const updateAdmin = async (req, res) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
        const { name, email, password, role, permissions, status } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        if (status)
            updateData.status = status;
        if (permissions)
            updateData.permissions = typeof permissions === 'object' ? JSON.stringify(permissions) : permissions;
        if (password) {
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        }
        await prisma_1.prisma.admins.update({
            where: { id },
            data: updateData
        });
        res.json({ status: "success", message: "Admin updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating admin", error: error.message });
    }
};
exports.updateAdmin = updateAdmin;
const deleteAdmin = async (req, res) => {
    try {
        const { id: idParam } = req.params;
        const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
        // Protect super admin if needed, but for now just delete
        await prisma_1.prisma.admins.delete({
            where: { id }
        });
        res.json({ status: "success", message: "Admin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting admin", error: error.message });
    }
};
exports.deleteAdmin = deleteAdmin;
const clearCache = async (req, res) => {
    // In a real app, this might clear Redis or file cache
    // For now, we'll just return success
    res.json({ status: "success", message: "System cache cleared successfully" });
};
exports.clearCache = clearCache;
const toggleMaintenance = async (req, res) => {
    try {
        const setting = await prisma_1.prisma.settings.findUnique({
            where: { key: 'maintenance_mode' }
        });
        const currentMode = setting?.value === 'on' ? 'off' : 'on';
        await prisma_1.prisma.settings.upsert({
            where: { key: 'maintenance_mode' },
            update: { value: currentMode },
            create: { key: 'maintenance_mode', value: currentMode, group: 'system' }
        });
        res.json({
            status: "success",
            message: `Maintenance mode turned ${currentMode}`,
            mode: currentMode
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error toggling maintenance mode", error: error.message });
    }
};
exports.toggleMaintenance = toggleMaintenance;
