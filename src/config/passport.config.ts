import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

interface SocialProfile {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
}

// Helper to get social login settings from database
const getSocialSettings = async () => {
    const settings = await prisma.api_settings.findMany({
        where: { group: 'social_login' }
    });
    return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string | null>);
};

// Helper to find or create user from social profile
const findOrCreateSocialUser = async (profile: SocialProfile) => {
    // Check if user exists with this social provider
    let user = await prisma.users.findFirst({
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
        user = await prisma.users.create({
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
    } else if (!user.social_provider || !user.social_id) {
        // Update existing user with social info
        user = await prisma.users.update({
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
export const initializePassport = async () => {
    const settings = await getSocialSettings();

    // Google OAuth Strategy
    if (settings.google_login_active === "1" && settings.google_client_id && settings.google_client_secret) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: settings.google_client_id,
                    clientSecret: settings.google_client_secret,
                    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/social/callback/google`,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error("No email found in Google profile"), undefined);
                        }

                        const socialProfile: SocialProfile = {
                            provider: 'google',
                            providerId: profile.id,
                            email,
                            name: profile.displayName,
                            avatar: profile.photos?.[0]?.value,
                        };

                        const user = await findOrCreateSocialUser(socialProfile);
                        return done(null, user);
                    } catch (error) {
                        return done(error as Error, undefined);
                    }
                }
            )
        );
    }

    // Facebook OAuth Strategy
    if (settings.facebook_login_active === "1" && settings.facebook_client_id && settings.facebook_client_secret) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: settings.facebook_client_id,
                    clientSecret: settings.facebook_client_secret,
                    callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/social/callback/facebook`,
                    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error("No email found in Facebook profile"), undefined);
                        }

                        const socialProfile: SocialProfile = {
                            provider: 'facebook',
                            providerId: profile.id,
                            email,
                            name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
                            avatar: profile.photos?.[0]?.value,
                        };

                        const user = await findOrCreateSocialUser(socialProfile);
                        return done(null, user);
                    } catch (error) {
                        return done(error as Error, undefined);
                    }
                }
            )
        );
    }

    // Serialize user for session (optional, if using sessions)
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await prisma.users.findUnique({ where: { id } });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

// Generate JWT token for authenticated user
export const generateSocialToken = (user: any) => {
    const secret = process.env.JWT_SECRET || "your_very_secret_key_here_shhh";
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: "customer",
            social_provider: user.social_provider
        },
        secret,
        { expiresIn: "30d" }
    );
};
