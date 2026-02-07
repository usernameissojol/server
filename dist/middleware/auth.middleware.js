"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ status: "error", message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ status: "error", message: "Unauthorized: Invalid token" });
    }
};
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    (0, exports.authenticate)(req, res, () => {
        if (req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "subadmin")) {
            next();
        }
        else {
            res.status(403).json({ status: "error", message: "Forbidden: Admin access required" });
        }
    });
};
exports.isAdmin = isAdmin;
