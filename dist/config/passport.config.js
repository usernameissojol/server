"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSocialToken = exports.initializePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Helper to get social login settings from database
const getSocialSettings = async () => {
    const settings = await prisma_1.prisma.api_settings.findMany({
        where: { group: 'social_login' }
    });
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
};
// Helper to find or create user from social profile
const findOrCreateSocialUser = async (profile) => {
    // Check if user exists with this social provider
    let user = await prisma_1.prisma.users.findFirst({
        where: {
            OR: [
                { email: profile.email },
                {
                    social_provider: profile.provider,
                    social_id: profile.providerId
                }
            ]
        }
    });
    if (!user) {
        // Create new user
        user = await prisma_1.prisma.users.create({
            data: {
                name: profile.name,
                email: profile.email,
                password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10), // Required in schema
                social_provider: profile.provider,
                social_id: profile.providerId,
                avatar: profile.avatar || null,
                status: 'active',
                email_verified: true, // Social logins are pre-verified
            }
        });
    }
    else if (!user.social_provider || !user.social_id) {
        // Update existing user with social info
        user = await prisma_1.prisma.users.update({
            where: { id: user.id },
            data: {
                social_provider: profile.provider,
                social_id: profile.providerId,
                avatar: profile.avatar || user.avatar,
                email_verified: true,
            }
        });
    }
    return user;
};
// Initialize Passport strategies
const initializePassport = async () => {
    const settings = await getSocialSettings();
    // Google OAuth Strategy
    if (settings.google_login_active === "1" && settings.google_client_id && settings.google_client_secret) {
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: settings.google_client_id,
            clientSecret: settings.google_client_secret,
            callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/social/callback/google`,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error("No email found in Google profile"), undefined);
                }
                const socialProfile = {
                    provider: 'google',
                    providerId: profile.id,
                    email,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                };
                const user = await findOrCreateSocialUser(socialProfile);
                return done(null, user);
            }
            catch (error) {
                return done(error, undefined);
            }
        }));
    }
    // Facebook OAuth Strategy
    if (settings.facebook_login_active === "1" && settings.facebook_client_id && settings.facebook_client_secret) {
        passport_1.default.use(new passport_facebook_1.Strategy({
            clientID: settings.facebook_client_id,
            clientSecret: settings.facebook_client_secret,
            callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/social/callback/facebook`,
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error("No email found in Facebook profile"), undefined);
                }
                const socialProfile = {
                    provider: 'facebook',
                    providerId: profile.id,
                    email,
                    name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
                    avatar: profile.photos?.[0]?.value,
                };
                const user = await findOrCreateSocialUser(socialProfile);
                return done(null, user);
            }
            catch (error) {
                return done(error, undefined);
            }
        }));
    }
    // Serialize user for session (optional, if using sessions)
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await prisma_1.prisma.users.findUnique({ where: { id } });
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
};
exports.initializePassport = initializePassport;
// Generate JWT token for authenticated user
const generateSocialToken = (user) => {
    const secret = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: "customer",
        social_provider: user.social_provider
    }, secret, { expiresIn: "30d" });
};
exports.generateSocialToken = generateSocialToken;
