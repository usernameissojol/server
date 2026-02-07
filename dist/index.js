"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const method_override_1 = __importDefault(require("method-override"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, method_override_1.default)("_method")); // Support for PHP-style method override ?_method=DELETE
// Initialize Passport
app.use(passport_1.default.initialize());
// Initialize Passport strategies (async)
const passport_config_1 = require("./config/passport.config");
(0, passport_config_1.initializePassport)().catch(console.error);
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
const uploadsPath = path_1.default.join(process.cwd(), "uploads");
const subfolders = ["gallery", "products", "profile", "banners", "popups", "settings", "categories", "brands"];
// Ensure upload directories exist
const fs_1 = __importDefault(require("fs"));
if (!fs_1.default.existsSync(uploadsPath))
    fs_1.default.mkdirSync(uploadsPath);
subfolders.forEach(folder => {
    const p = path_1.default.join(uploadsPath, folder);
    if (!fs_1.default.existsSync(p))
        fs_1.default.mkdirSync(p);
});
app.use("/api/uploads", express_1.default.static(uploadsPath));
app.use("/uploads", express_1.default.static(uploadsPath));
// Direct access fallbacks for specific folders/paths
subfolders.forEach(folder => {
    app.use(`/api/${folder}`, express_1.default.static(path_1.default.join(uploadsPath, folder)));
});
// Missing image fallback to prevent 404 errors in console
app.use("/api/uploads", (req, res, next) => {
    // If it reached here, express.static didn't find it
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return res.sendFile(path_1.default.join(process.cwd(), "../public/placeholder.svg"));
    }
    next();
});
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const content_routes_1 = __importDefault(require("./routes/content.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const revenue_routes_1 = __importDefault(require("./routes/revenue.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const banner_routes_1 = __importDefault(require("./routes/banner.routes"));
const carousel_routes_1 = __importDefault(require("./routes/carousel.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const gallery_routes_1 = __importDefault(require("./routes/gallery.routes"));
const footer_routes_1 = __importDefault(require("./routes/footer.routes"));
const taxonomy_routes_1 = __importDefault(require("./routes/taxonomy.routes"));
const popup_routes_1 = __importDefault(require("./routes/popup.routes"));
const page_routes_1 = __importDefault(require("./routes/page.routes"));
const landing_page_routes_1 = __importDefault(require("./routes/landing-page.routes"));
const landing_page_template_routes_1 = __importDefault(require("./routes/landing-page-template.routes"));
const daily_target_routes_1 = __importDefault(require("./routes/daily-target.routes"));
const income_category_routes_1 = __importDefault(require("./routes/income-category.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const tutorial_routes_1 = __importDefault(require("./routes/tutorial.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
app.use("/api/daily-targets", daily_target_routes_1.default);
app.use("/api/auth", auth_routes_1.default); // Handles /api/auth/login, /api/auth/register
app.use("/api/admin", auth_routes_1.default); // Handles /api/admin/login
app.use("/api/user", user_routes_1.default); // Handles /api/user/profile
app.use("/api/products", product_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/banners", banner_routes_1.default);
app.use("/api/footer-links", footer_routes_1.default);
app.use("/api/brands", brand_routes_1.default);
app.use("/api/gallery", gallery_routes_1.default);
app.use("/api/popups", popup_routes_1.default);
app.use("/api/pages", page_routes_1.default);
app.use("/api/landing-pages", landing_page_routes_1.default);
app.use("/api/landing-page-templates", landing_page_template_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api", taxonomy_routes_1.default); // Handles /api/tags and /api/attributes
app.use("/api/carousels", carousel_routes_1.default);
app.use("/api/settings", content_routes_1.default); // Handles /api/settings/ (for admin)
app.use("/api/content", content_routes_1.default); // Handles /api/content/settings, /api/content/active-popup, /api/content/footer-links
app.use("/api/orders", order_routes_1.default);
app.use("/api/revenue", revenue_routes_1.default);
app.use("/api/income-categories", income_category_routes_1.default); // Reuse revenue routes if categories are there or fix later
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/expenses", expense_routes_1.default);
app.use("/api/support", support_routes_1.default);
app.use("/api/blogs", blog_routes_1.default);
app.use("/api/seo", seo_routes_1.default);
app.use("/api/tutorials", tutorial_routes_1.default);
const activity_log_routes_1 = __importDefault(require("./routes/activity-log.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const payout_routes_1 = __importDefault(require("./routes/payout.routes"));
const admin_control_routes_1 = __importDefault(require("./routes/admin-control.routes"));
const fraud_check_routes_1 = __importDefault(require("./routes/fraud-check.routes"));
const delivery_location_routes_1 = __importDefault(require("./routes/delivery-location.routes"));
const courier_routes_1 = __importDefault(require("./routes/courier.routes"));
const pathao_routes_1 = __importDefault(require("./routes/pathao.routes"));
const redx_routes_1 = __importDefault(require("./routes/redx.routes"));
const paperfly_routes_1 = __importDefault(require("./routes/paperfly.routes"));
const ecourier_routes_1 = __importDefault(require("./routes/ecourier.routes"));
const sms_routes_1 = __importDefault(require("./routes/sms.routes"));
const payment_method_routes_1 = __importDefault(require("./routes/payment-method.routes"));
const social_auth_routes_1 = __importDefault(require("./routes/social-auth.routes"));
app.use("/api/activity-logs", activity_log_routes_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/payouts", payout_routes_1.default);
app.use("/api/admin-control", admin_control_routes_1.default);
app.use("/api/fraud", fraud_check_routes_1.default);
app.use("/api/delivery-locations", delivery_location_routes_1.default);
app.use("/api/courier", courier_routes_1.default);
app.use("/api/pathao", pathao_routes_1.default);
app.use("/api/redx", redx_routes_1.default);
app.use("/api/paperfly", paperfly_routes_1.default);
app.use("/api/ecourier", ecourier_routes_1.default);
app.use("/api/sms", sms_routes_1.default);
app.use("/api/payment-methods", payment_method_routes_1.default);
app.use("/api/social", social_auth_routes_1.default);
// Generic 404 for undefined /api routes
app.all("/api/*path", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.originalUrl}`
    });
});
// Final Error Handler
app.use((err, req, res, next) => {
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
    const frontendPath = path_1.default.join(process.cwd(), '..');
    console.log(`📦 Serving frontend from: ${frontendPath}`);
    app.use(express_1.default.static(frontendPath));
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
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
    });
}
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend served from parent directory`);
    }
});
