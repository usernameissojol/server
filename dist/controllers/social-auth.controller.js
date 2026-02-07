"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialLoginStatus = exports.facebookCallback = exports.facebookAuth = exports.googleCallback = exports.googleAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_config_1 = require("../config/passport.config");
// Initiate Google OAuth
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});
// Google OAuth Callback
const googleCallback = (req, res, next) => {
    passport_1.default.authenticate('google', { session: false }, (err, user, info) => {
        if (err || !user) {
            // Redirect to frontend with error
            const errorMessage = err?.message || 'Authentication failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(errorMessage)}`);
        }
        try {
            // Generate JWT token
            const token = (0, passport_config_1.generateSocialToken)(user);
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/social-callback?token=${token}&provider=google`);
        }
        catch (error) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
};
exports.googleCallback = googleCallback;
// Initiate Facebook OAuth
exports.facebookAuth = passport_1.default.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
});
// Facebook OAuth Callback
const facebookCallback = (req, res, next) => {
    passport_1.default.authenticate('facebook', { session: false }, (err, user, info) => {
        if (err || !user) {
            const errorMessage = err?.message || 'Authentication failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(errorMessage)}`);
        }
        try {
            const token = (0, passport_config_1.generateSocialToken)(user);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/social-callback?token=${token}&provider=facebook`);
        }
        catch (error) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
};
exports.facebookCallback = facebookCallback;
// Get social login status (for frontend to check which providers are enabled)
const getSocialLoginStatus = async (req, res) => {
    try {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../lib/prisma")));
        const settings = await prisma.api_settings.findMany({
            where: {
                group: 'social_login',
                key: { in: ['google_login_active', 'facebook_login_active'] }
            }
        });
        const status = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value === "1"
        }), {});
        res.json({
            google: status.google_login_active || false,
            facebook: status.facebook_login_active || false
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch social login status",
            error: error.message
        });
    }
};
exports.getSocialLoginStatus = getSocialLoginStatus;
