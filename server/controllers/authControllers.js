const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");

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

        const userExists = await User.findOne({ email });

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
            name,
            email,
            password: hashedPassword
        });

        return successResponse(
            res,
            201,
            "User Registered Successfully",
            user
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
        const user = await User.findOne({ email });

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
            .select("-password");

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

        const user = await User.findOne({ email });

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

        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        user.emailVerificationToken =
            verificationToken;

        user.emailVerificationExpire =
            new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        return successResponse(
            res,
            200,
            "Verification token generated successfully",
            {
                verificationToken
            }
        );

    } catch (error) {
        console.error(
            "Resend Verification Error:",
            error
        );

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

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpire: {
                $gt: new Date()
            }
        });

        if (!user) {
            return errorResponse(
                res,
                400,
                "Invalid or expired verification token"
            );
        }

        user.isVerified = true;

        user.emailVerificationToken = null;
        user.emailVerificationExpire = null;

        await user.save();

        return successResponse(
            res,
            200,
            "Email verified successfully"
        );

    } catch (error) {
        console.error(
            "Verify Email Error:",
            error
        );

        return errorResponse(
            res,
            500,
            "Email verification failed"
        );
    }
};


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