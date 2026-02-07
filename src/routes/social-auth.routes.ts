import express from "express";
import {
    googleAuth,
    googleCallback,
    facebookAuth,
    facebookCallback,
    getSocialLoginStatus
} from "../controllers/social-auth.controller";

const router = express.Router();

// Get social login status (which providers are enabled)
router.get("/status", getSocialLoginStatus);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/callback/google", googleCallback);

// Facebook OAuth routes
router.get("/facebook", facebookAuth);
router.get("/callback/facebook", facebookCallback);

export default router;
