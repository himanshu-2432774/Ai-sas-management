const express = require("express");

const router = express.Router();

const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    resendVerification
} = require("../controllers/authController");


const protect = require("../middleware/authmiddleware.js");
router.post(
    "/resend-verification",
    resendVerification
);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/login", login);

router.get("/me", protect, getMe);

module.exports = router;
