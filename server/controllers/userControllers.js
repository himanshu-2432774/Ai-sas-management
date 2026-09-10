const User = require("../models/User");
const bcrypt = require("bcrypt");
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const {
    successResponse,
    errorResponse
      } = require("../utils/apiResponse");

        successResponse(res, 200, "Profile fetched successfully", user);
        

    } catch (error) {
        errorResponse(res, 500, "Server error");
    }
};
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
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

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters"
            });
        }

        // Find logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        res.status(500).json({
            message: "Failed to change password"
        });
    }
};
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete Account Error:", error);

        res.status(500).json({
            message: "Failed to delete account"
        });
    }
};
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isActive = false;

        await user.save();

        res.status(200).json({
            message: "Account deactivated successfully"
        });

    } catch (error) {
        console.error("Deactivate Account Error:", error);

        res.status(500).json({
            message: "Failed to deactivate account"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    deactivateAccount
};
    