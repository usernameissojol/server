"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// This router is mounted on both /api/auth and /api/admin
router.post("/login", (req, res) => {
    if (req.baseUrl.includes("admin")) {
        return (0, auth_controller_1.adminLogin)(req, res);
    }
    return (0, auth_controller_1.userLogin)(req, res);
});
router.post("/register", auth_controller_1.userRegister);
// Fallback for the explicit /admin/login if the above logic is too clever
// router.post("/admin/login", adminLogin); // If mounted on /api
exports.default = router;
