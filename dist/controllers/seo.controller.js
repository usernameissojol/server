"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSitemap = exports.updateRobotsTxt = exports.getRobotsTxt = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const ROBOTS_TXT_PATH = path_1.default.join(process.cwd(), "../robots.txt"); // Assuming api is in a subdir of root
// OR if public/robots.txt
// Check if robots.txt exists in public? Or root? Usually root for production serving.
// For now let's assume root or public. The server structure suggests `api` folder parallel to `src` (frontend).
// Typically robots.txt is in the public folder of the frontend build. 
// Ehaam/public/robots.txt
const PUBLIC_ROBOTS_PATH = path_1.default.join(process.cwd(), "../public/robots.txt");
const DIST_ROBOTS_PATH = path_1.default.join(process.cwd(), "../dist/robots.txt"); // For local dev serving if needed? 
// We will write to 'public/robots.txt' generally.
const getRobotsTxt = async (req, res) => {
    try {
        if (fs_1.default.existsSync(PUBLIC_ROBOTS_PATH)) {
            const content = fs_1.default.readFileSync(PUBLIC_ROBOTS_PATH, "utf-8");
            res.json({ content });
        }
        else {
            res.json({ content: "User-agent: *\nAllow: /" });
        }
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error reading robots.txt", error: error.message });
    }
};
exports.getRobotsTxt = getRobotsTxt;
const updateRobotsTxt = async (req, res) => {
    try {
        const { content } = req.body;
        fs_1.default.writeFileSync(PUBLIC_ROBOTS_PATH, content);
        // Keep in sync with database settings for consistency
        await prisma_1.prisma.settings.upsert({
            where: { key: 'seo_robots_txt' },
            update: { value: content },
            create: { key: 'seo_robots_txt', value: content, group: 'seo' }
        });
        // Also update dist if it exists
        if (fs_1.default.existsSync(DIST_ROBOTS_PATH)) {
            fs_1.default.writeFileSync(DIST_ROBOTS_PATH, content);
        }
        res.json({ status: "success", message: "Robots.txt updated and synced" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating robots.txt", error: error.message });
    }
};
exports.updateRobotsTxt = updateRobotsTxt;
const generateSitemap = async (req, res) => {
    try {
        // Fetch all dynamic routes (products, categories, pages, blogs)
        const products = await prisma_1.prisma.products.findMany({ select: { slug: true, created_at: true } });
        const categories = await prisma_1.prisma.categories.findMany({ select: { slug: true } });
        const pages = await prisma_1.prisma.pages.findMany({ select: { slug: true, updated_at: true } });
        const blogs = await prisma_1.prisma.blogs.findMany({ select: { slug: true, updated_at: true } });
        const baseUrl = process.env.FRONTEND_URL || "https://yourwebsite.com";
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        // Static routes
        const staticRoutes = ["", "/shop", "/blog", "/contact", "/about"];
        staticRoutes.forEach(route => {
            sitemap += `
    <url>
        <loc>${baseUrl}${route}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
        products.forEach(p => {
            sitemap += `
    <url>
        <loc>${baseUrl}/product/${p.slug}</loc>
        <lastmod>${new Date(p.created_at || Date.now()).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`;
        });
        categories.forEach(c => {
            sitemap += `
    <url>
        <loc>${baseUrl}/category/${c.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
        pages.forEach(p => {
            sitemap += `
    <url>
        <loc>${baseUrl}/p/${p.slug}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        blogs.forEach(b => {
            sitemap += `
    <url>
        <loc>${baseUrl}/blog/${b.slug}</loc>
        <lastmod>${new Date(b.updated_at || Date.now()).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
        });
        sitemap += `
</urlset>`;
        const sitemapPath = path_1.default.join(process.cwd(), "../public/sitemap.xml");
        fs_1.default.writeFileSync(sitemapPath, sitemap);
        res.json({ status: "success", message: "Sitemap generated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error generating sitemap", error: error.message });
    }
};
exports.generateSitemap = generateSitemap;
