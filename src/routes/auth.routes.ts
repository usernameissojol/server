import { Router } from "express";
import { adminLogin, userLogin, userRegister } from "../controllers/auth.controller";

const router = Router();

// This router is mounted on both /api/auth and /api/admin
router.post("/login", (req, res) => {
    if (req.baseUrl.includes("admin")) {
        return adminLogin(req, res);
    }
    return userLogin(req, res);
});

router.post("/register", userRegister);

// Fallback for the explicit /admin/login if the above logic is too clever
// router.post("/admin/login", adminLogin); // If mounted on /api

export default router;
