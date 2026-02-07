import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import methodOverride from "method-override";
import passport from "passport";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // Support for PHP-style method override ?_method=DELETE

// Initialize Passport
app.use(passport.initialize());

// Initialize Passport strategies (async)
import { initializePassport } from "./config/passport.config";
initializePassport().catch(console.error);

// Debugging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        // Log keys only to avoid sensitive data/bloat
        console.log(`  Body Keys: ${Object.keys(req.body).join(", ")}`);
    }
    next();
});

// Health Check
app.get("/", (req, res) => {
    res.json({
        status: "online",
        project: "Ehaam Node.js API",
        version: "1.0.0",
    });
});

// Static Files
const uploadsPath = path.join(process.cwd(), "uploads");
const subfolders = ["gallery", "products", "profile", "banners", "popups", "settings", "categories", "brands"];

// Ensure upload directories exist
import fs from "fs";
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
subfolders.forEach(folder => {
    const p = path.join(uploadsPath, folder);
    if (!fs.existsSync(p)) fs.mkdirSync(p);
});

app.use("/api/uploads", express.static(uploadsPath));
app.use("/uploads", express.static(uploadsPath));

// Direct access fallbacks for specific folders/paths
subfolders.forEach(folder => {
    app.use(`/api/${folder}`, express.static(path.join(uploadsPath, folder)));
});

// Missing image fallback to prevent 404 errors in console
app.use("/api/uploads", (req, res, next) => {
    // If it reached here, express.static didn't find it
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return res.sendFile(path.join(process.cwd(), "../public/placeholder.svg"));
    }
    next();
});

// Import Routes
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import contentRoutes from "./routes/content.routes";
import orderRoutes from "./routes/order.routes";
import revenueRoutes from "./routes/revenue.routes";
import couponRoutes from "./routes/coupon.routes";
import categoryRoutes from "./routes/category.routes";
import bannerRoutes from "./routes/banner.routes";
import carouselRoutes from "./routes/carousel.routes";
import customerRoutes from "./routes/customer.routes";
import reviewRoutes from "./routes/review.routes";
import brandRoutes from "./routes/brand.routes";
import galleryRoutes from "./routes/gallery.routes";
import footerRoutes from "./routes/footer.routes";
import taxonomyRoutes from "./routes/taxonomy.routes";
import popupRoutes from "./routes/popup.routes";
import pageRoutes from "./routes/page.routes";
import landingPageRoutes from "./routes/landing-page.routes";
import landingPageTemplateRoutes from "./routes/landing-page-template.routes";
import dailyTargetRoutes from "./routes/daily-target.routes";
import incomeCategoryRoutes from "./routes/income-category.routes";
import expenseRoutes from "./routes/expense.routes";
import supportRoutes from "./routes/support.routes";
import blogRoutes from "./routes/blog.routes";
import seoRoutes from "./routes/seo.routes";
import tutorialRoutes from "./routes/tutorial.routes";


import userRoutes from "./routes/user.routes";

app.use("/api/daily-targets", dailyTargetRoutes);
app.use("/api/auth", authRoutes); // Handles /api/auth/login, /api/auth/register
app.use("/api/admin", authRoutes); // Handles /api/admin/login
app.use("/api/user", userRoutes); // Handles /api/user/profile
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
app.use("/api", taxonomyRoutes); // Handles /api/tags and /api/attributes
app.use("/api/carousels", carouselRoutes);
app.use("/api/settings", contentRoutes); // Handles /api/settings/ (for admin)
app.use("/api/content", contentRoutes); // Handles /api/content/settings, /api/content/active-popup, /api/content/footer-links
app.use("/api/orders", orderRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/income-categories", incomeCategoryRoutes); // Reuse revenue routes if categories are there or fix later
app.use("/api/coupons", couponRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/tutorials", tutorialRoutes);
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

// Generic 404 for undefined /api routes
app.all("/api/*path", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.originalUrl}`
    });
});

// Final Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[ERROR] ${err.stack || err.message}`);
    res.status(err.status || 500).json({
        status: "error",
        message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message
    });
});

// ========================================
// FRONTEND STATIC FILES SERVING (Production)
// ========================================
if (process.env.NODE_ENV === 'production') {
    // Serve React build files from parent directory (one level up from 'api')
    const frontendPath = path.join(process.cwd(), '..');
    console.log(`📦 Serving frontend from: ${frontendPath}`);

    app.use(express.static(frontendPath));

    // Catch-all route for React Router (SPA)
    // Must be AFTER all API routes to avoid conflicts
    app.get('*', (req, res) => {
        // Don't serve index.html for API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({
                status: "error",
                message: `API route not found: ${req.originalUrl}`
            });
        }

        // Serve React app for all other routes
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend served from parent directory`);
    }
});
