import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "uploads/";

        // Determine subfolder based on request path or fieldname
        if (req.originalUrl.includes("gallery")) {
            folder += "gallery/";
        } else if (req.originalUrl.includes("products")) {
            folder += "products/";
        } else if (req.originalUrl.includes("categories")) {
            folder += "categories/";
        } else if (req.originalUrl.includes("brands")) {
            folder += "brands/";
        } else if (req.originalUrl.includes("profile")) {
            folder += "profile/";
        } else if (req.originalUrl.includes("banners")) {
            folder += "banners/";
        } else if (req.originalUrl.includes("popups")) {
            folder += "popups/";
        } else if (req.originalUrl.includes("settings") || req.originalUrl.includes("content")) {
            folder += "settings/";
        }

        const fullPath = path.join(process.cwd(), folder);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
