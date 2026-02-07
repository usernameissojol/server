"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = "uploads/";
        // Determine subfolder based on request path or fieldname
        if (req.originalUrl.includes("gallery")) {
            folder += "gallery/";
        }
        else if (req.originalUrl.includes("products")) {
            folder += "products/";
        }
        else if (req.originalUrl.includes("categories")) {
            folder += "categories/";
        }
        else if (req.originalUrl.includes("brands")) {
            folder += "brands/";
        }
        else if (req.originalUrl.includes("profile")) {
            folder += "profile/";
        }
        else if (req.originalUrl.includes("banners")) {
            folder += "banners/";
        }
        else if (req.originalUrl.includes("popups")) {
            folder += "popups/";
        }
        else if (req.originalUrl.includes("settings") || req.originalUrl.includes("content")) {
            folder += "settings/";
        }
        const fullPath = path_1.default.join(process.cwd(), folder);
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images are allowed"), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
