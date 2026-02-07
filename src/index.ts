import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import methodOverride from "method-override";
import passport from "passport";
import fs from "fs";

import { initializePassport } from "./config/passport.config";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import bannerRoutes from "./routes/banner.routes";
import footerRoutes from "./routes/footer.routes";
import brandRoutes from "./routes/brand.routes";
import galleryRoutes from "./routes/gallery.routes";
import popupRoutes from "./routes/popup.routes";
import pageRoutes from "./routes/page.routes";
import landingPageRoutes from "./routes/landing-page.routes";
import landingPageTemplateRoutes from "./routes/landing-page-template.routes";
import reviewRoutes from "./routes/review.routes";
import taxonomyRoutes from "./routes/taxonomy.routes";
import carouselRoutes from "./routes/carousel.routes";
import contentRoutes from "./routes/content.routes";
import orderRoutes from "./routes/order.routes";
import revenueRoutes from "./routes/revenue.routes";
import incomeCategoryRoutes from "./routes/income-category.routes";
import couponRoutes from "./routes/coupon.routes";
import customerRoutes from "./routes/customer.routes";
import expenseRoutes from "./routes/expense.routes";
import supportRoutes from "./routes/support.routes";
import blogRoutes from "./routes/blog.routes";
import seoRoutes from "./routes/seo.routes";
import tutorialRoutes from "./routes/tutorial.routes";
import activityLogRoutes from "./routes/activity-log.routes";
import transactionRoutes from "./routes/transaction.routes";
import payoutRoutes from "./routes/payout.routes";
import adminControlRoutes from "./routes/admin-control.routes";
import fraudCheckRoutes from "./routes/fraud-check.routes";
import deliveryLocationRoutes from "./routes/delivery-location.routes";
import courierRoutes from "./routes/courier.routes";
import pathaoRoutes from "./routes/pathao.routes";
import redxRoutes from "./routes/redx.routes";
import paperflyRoutes from "./routes/paperfly.routes";
import ecourierRoutes from "./routes/ecourier.routes";
import smsRoutes from "./routes/sms.routes";
import paymentMethodRoutes from "./routes/payment-method.routes";
import socialAuthRoutes from "./routes/social-auth.routes";
import dailyTargetRoutes from "./routes/daily-target.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ==========================
// Middleware
// ==========================
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Passport
app.use(passport.initialize());
initializePassport().catch(console.error);

// ==========================
// Logging Middleware (Dev Only)
// ==========================
if (process.env.NODE_ENV !== "production") {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        if (req.body && Object.keys(req.body).length > 0) {
            console.log(`  Body Keys: ${Object.keys(req.body).join(", ")}`);
        }
        next();
    });
}

// ==========================
// Health Check
// ==========================
app.get("/", (req: Request, res: Response) => {
    res.json({
        status: "online",
        project: "Ehaam Node.js API",
        version: "1.0.0",
    });
});

// ==========================
// Uploads & Static Files
// ==========================
const uploadsPath = path.join(process.cwd(), "uploads");
const subfolders = ["gallery", "products", "profile", "banners", "popups", "settings", "categories", "brands"];

if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
subfolders.forEach(folder => {
    const p = path.join(uploadsPath, folder);
    if (!fs.existsSync(p)) fs.mkdirSync(p);
});

app.use("/api/uploads", express.static(uploadsPath));
app.use("/uploads", express.static(uploadsPath));

subfolders.forEach(folder => {
    app.use(`/api/${folder}`, express.static(path.join(uploadsPath, folder)));
});

// Missing image fallback
app.use("/api/uploads", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return res.sendFile(path.join(process.cwd(), "../public/placeholder.svg"));
    }
    next();
});

// ==========================
// API Routes
// ==========================
app.use("/api/daily-targets", dailyTargetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/footer-links", footerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/popups", popupRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/landing-pages", landingPageRoutes);
app.use("/api/landing-page-templates", landingPageTemplateRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", taxonomyRoutes);
app.use("/api/carousels", carouselRoutes);
app.use("/api/settings", contentRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/income-categories", incomeCategoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/tutorials", tutorialRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/admin-control", adminControlRoutes);
app.use("/api/fraud", fraudCheckRoutes);
app.use("/api/delivery-locations", deliveryLocationRoutes);
app.use("/api/courier", courierRoutes);
app.use("/api/pathao", pathaoRoutes);
app.use("/api/redx", redxRoutes);
app.use("/api/paperfly", paperflyRoutes);
app.use("/api/ecourier", ecourierRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/social", socialAuthRoutes);

// 404 for undefined /api
app.all("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: `Route not found: ${req.originalUrl}` });
});

// ==========================
// Error Handler
// ==========================
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err instanceof Error ? err.stack : err}`);
    res.status((err as any)?.status || 500).json({
        status: "error",
        message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : (err as any)?.message || "Unknown Error"
    });
});

// ==========================
// Frontend SPA (Production)
// ==========================
if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(process.cwd(), "..");
    console.log(`📦 Serving frontend from: ${frontendPath}`);
    app.use(express.static(frontendPath));

    app.get("*", (req: Request, res: Response) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({ status: "error", message: `API route not found: ${req.originalUrl}` });
        }
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

// ==========================
// Start Server
// ==========================
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    if (process.env.NODE_ENV === "production") console.log("🌐 Frontend served from parent directory");
});
