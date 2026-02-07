import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";

export const authenticate = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ status: "error", message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: "error", message: "Unauthorized: Invalid token" });
    }
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    authenticate(req, res, () => {
        if (req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "subadmin")) {
            next();
        } else {
            res.status(403).json({ status: "error", message: "Forbidden: Admin access required" });
        }
    });
};
