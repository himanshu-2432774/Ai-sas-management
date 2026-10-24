const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { logEmailDeliveryFailure } = require("../utils/emailDeliveryError");
const {
    createVerificationToken,
    hashVerificationToken
} = require("../utils/emailVerificationToken");

const {
    successResponse,
    errorResponse
} = require("../utils/apiResponse");


// =====================================
// Forgot Password
// =====================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(
                res,
                400,
                "Email is required"
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        user.resetPasswordToken = resetToken;

        user.resetPasswordExpire =
            new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        return successResponse(
            res,
            200,
            "Password reset token generated successfully",
            { resetToken }
        );

    } catch (error) {
        console.error("Forgot Password Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to process forgot password request"
        );
    }
};


// =====================================
// Reset Password
// =====================================
const resetPassword = async (req, res) => {
    try {
        const {
            token,
            newPassword
        } = req.body;

        if (!token || !newPassword) {
            return errorResponse(
                res,
                400,
                "Token and new password are required"
            );
        }

        if (newPassword.length < 6) {
            return errorResponse(
                res,
                400,
                "Password must be at least 6 characters"
            );
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: {
                $gt: new Date()
            }
        });

        if (!user) {
            return errorResponse(
                res,
                400,
                "Invalid or expired reset token"
            );
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        return successResponse(
            res,
            200,
            "Password reset successfully"
        );

    } catch (error) {
        console.error("Reset Password Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to reset password"
        );
    }
};


// =====================================
// Register
// =====================================
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return errorResponse(
                res,
                400,
                "All fields required"
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return errorResponse(
                res,
                400,
                "User already exists"
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const verification = createVerificationToken();
        user.emailVerificationToken = verification.tokenHash;
        user.emailVerificationExpire = verification.expiresAt;
        await user.save();

        let verificationEmailSent = false;
        try {
            await sendVerificationEmail(user, verification.token);
            verificationEmailSent = true;
        } catch (error) {
            logEmailDeliveryFailure("signup verification", error);
            // Keep the account and token so the user can retry via resend.
        }

        return successResponse(
            res,
            201,
            verificationEmailSent
                ? "Account created. Check your email to verify your account."
                : "Account created, but the verification email could not be sent. Check the server email configuration or try resending later.",
            { verificationEmailSent }
        );

    } catch (error) {
        console.error("Register Error:", error);

        return errorResponse(
            res,
            500,
            "Registration failed"
        );
    }
};


// =====================================
// Login
// =====================================
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Check required fields
        if (!email || !password) {
            return errorResponse(
                res,
                400,
                "Email and password are required"
            );
        }

        // Find user
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        // Check password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return errorResponse(
                res,
                401,
                "Invalid Credentials"
            );
        }

        // Check account status
        if (!user.isActive) {
            return errorResponse(
                res,
                403,
                "Your account is deactivated"
            );
        }

        // Check email verification
        if (!user.isVerified) {
            return errorResponse(
                res,
                403,
                "Please verify your email before logging in"
            );
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return successResponse(
            res,
            200,
            "Login Successful",
            {
                token
            }
        );

    } catch (error) {
        console.error("Login Error:", error);

        return errorResponse(
            res,
            500,
            "Login failed"
        );
    }
};


// =====================================
// Get Me
// =====================================
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire");

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        return successResponse(
            res,
            200,
            "User profile fetched successfully",
            user
        );

    } catch (error) {
        console.error("Get Me Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch user profile"
        );
    }
};


// =====================================
// Resend Verification
// =====================================
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(
                res,
                400,
                "Email is required"
            );
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        if (user.isVerified) {
            return errorResponse(
                res,
                400,
                "Email is already verified"
            );
        }

        const verification = createVerificationToken();
        user.emailVerificationToken = verification.tokenHash;
        user.emailVerificationExpire = verification.expiresAt;

        await user.save();

        try {
            await sendVerificationEmail(user, verification.token);
        } catch (error) {
            logEmailDeliveryFailure("resend verification", error);
            return errorResponse(
                res,
                503,
                "Verification email could not be sent. Check the server email configuration and try again later."
            );
        }

        return successResponse(
            res,
            200,
            "Verification email sent. Check your inbox."
        );

    } catch (error) {
        console.error("Resend verification request failed.");

        return errorResponse(
            res,
            500,
            "Failed to resend verification email"
        );
    }
};


// =====================================
// Verify Email
// =====================================
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return errorResponse(
                res,
                400,
                "Verification token is required"
            );
        }

        if (!/^[a-f0-9]{64}$/i.test(token)) {
            return errorResponse(
                res,
                400,
                "Invalid or expired verification token"
            );
        }

        const user = await User.findOneAndUpdate(
            {
                emailVerificationToken: hashVerificationToken(token),
                emailVerificationExpire: {
                    $gt: new Date()
                }
            },
            {
                $set: {
                    isVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpire: null
                }
            },
            {
                returnDocument: "after"
            }
        );

        if (!user) {
            return errorResponse(
                res,
                400,
                "Invalid or expired verification token"
            );
        }

        return successResponse(
            res,
            200,
            "Email verified successfully"
        );

    } catch (error) {
        console.error("Email verification request failed.");

        return errorResponse(
            res,
            500,
            "Email verification failed"
        );
    }
};

async function sendVerificationEmail(user, token) {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        throw new Error("Frontend URL is not configured.");
    }

    const verificationUrl = new URL("/verify-email", frontendUrl);
    verificationUrl.searchParams.set("token", token);
    const link = verificationUrl.toString();
    const safeName = String(user.name || "there")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    await sendEmail({
        to: user.email,
        subject: "Verify your AI SaaS Management account",
        text: `Hello ${user.name || "there"},\n\nVerify your account using this link. It expires in 15 minutes and can only be used once:\n${link}\n\nIf you did not create this account, you can ignore this email.`,
        html: `<p>Hello ${safeName},</p><p>Verify your account using the link below. It expires in 15 minutes and can only be used once.</p><p><a href="${link}">Verify email address</a></p><p>If you did not create this account, you can ignore this email.</p>`
    });
}


// =====================================
// Exports
// =====================================
module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
};