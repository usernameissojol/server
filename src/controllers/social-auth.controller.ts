import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { generateSocialToken } from "../config/passport.config";

// Initiate Google OAuth
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});

// Google OAuth Callback
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            // Redirect to frontend with error
            const errorMessage = err?.message || 'Authentication failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(errorMessage)}`);
        }

        try {
            // Generate JWT token
            const token = generateSocialToken(user);

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/social-callback?token=${token}&provider=google`);
        } catch (error: any) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
};

// Initiate Facebook OAuth
export const facebookAuth = passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
});

// Facebook OAuth Callback
export const facebookCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('facebook', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            const errorMessage = err?.message || 'Authentication failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(errorMessage)}`);
        }

        try {
            const token = generateSocialToken(user);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/social-callback?token=${token}&provider=facebook`);
        } catch (error: any) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
};

// Get social login status (for frontend to check which providers are enabled)
export const getSocialLoginStatus = async (req: Request, res: Response) => {
    try {
        const { prisma } = await import("../lib/prisma");
        const settings = await prisma.api_settings.findMany({
            where: {
                group: 'social_login',
                key: { in: ['google_login_active', 'facebook_login_active'] }
            }
        });

        const status = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value === "1"
        }), {} as Record<string, boolean>);

        res.json({
            google: status.google_login_active || false,
            facebook: status.facebook_login_active || false
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch social login status",
            error: error.message
        });
    }
};
