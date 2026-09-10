const express = require("express");

const router = express.Router();

const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
} = require("../controllers/authControllers.js");

const protect = require("../middleware/authmiddleware.js");


// Resend verification
router.post(
    "/resend-verification",
    resendVerification
);


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 */

router.post("/register", register);


// Forgot password
router.post("/forgot-password", forgotPassword);


// Reset password
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified or deactivated
 */

// login user 
router.post("/login", login);


// Get current user
router.get("/me", protect, getMe);


// Verify email
router.get(
    "/verify-email/:token",
    verifyEmail
);


module.exports = router;