"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const social_auth_controller_1 = require("../controllers/social-auth.controller");
const router = express_1.default.Router();
// Get social login status (which providers are enabled)
router.get("/status", social_auth_controller_1.getSocialLoginStatus);
// Google OAuth routes
router.get("/google", social_auth_controller_1.googleAuth);
router.get("/callback/google", social_auth_controller_1.googleCallback);
// Facebook OAuth routes
router.get("/facebook", social_auth_controller_1.facebookAuth);
router.get("/callback/facebook", social_auth_controller_1.facebookCallback);
exports.default = router;
