const bcrypt = require("bcrypt");
const {
    successResponse,
    errorResponse
} = require("../utils/apiResponse");

const User = require("../models/User");


// ==========================
// Get Profile
// ==========================
const getProfile = async (req, res) => {
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
            "Profile fetched successfully",
            user
        );

    } catch (error) {
        console.error("Get Profile Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};


// ==========================
// Update Profile
// ==========================
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id)
            .select("-password");

        return successResponse(
            res,
            200,
            "Profile updated successfully",
            updatedUser
        );

    } catch (error) {
        console.error("Update Profile Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};


// ==========================
// Change Password
// ==========================
const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        // Check required fields
        if (!currentPassword || !newPassword) {
            return errorResponse(
                res,
                400,
                "Current password and new password are required"
            );
        }

        // Validate new password
        if (newPassword.length < 6) {
            return errorResponse(
                res,
                400,
                "New password must be at least 6 characters"
            );
        }

        // Find logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        // Check current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return errorResponse(
                res,
                401,
                "Current password is incorrect"
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        user.password = hashedPassword;

        await user.save();

        return successResponse(
            res,
            200,
            "Password changed successfully"
        );

    } catch (error) {
        console.error("Change Password Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to change password"
        );
    }
};


// ==========================
// Delete Account
// ==========================
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        await User.findByIdAndDelete(req.user.id);

        return successResponse(
            res,
            200,
            "Account deleted successfully"
        );

    } catch (error) {
        console.error("Delete Account Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to delete account"
        );
    }
};


// ==========================
// Deactivate Account
// ==========================
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        user.isActive = false;

        await user.save();

        return successResponse(
            res,
            200,
            "Account deactivated successfully"
        );

    } catch (error) {
        console.error("Deactivate Account Error:", error);

        return errorResponse(
            res,
            500,
            "Failed to deactivate account"
        );
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    deactivateAccount
};