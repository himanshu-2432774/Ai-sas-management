const User = require("../models/User");
const Usage = require("../models/Usage");

const getAdminStats = async (req, res) => {
    try {
        // Total users
        const totalUsers = await User.countDocuments();

        // Total admins
        const totalAdmins = await User.countDocuments({
            role: "admin"
        });

        // Get all usage records
        const usage = await Usage.find();

        // Total requests
        const totalRequests = usage.length;

        // Total credits used
        const totalCreditsUsed = usage.reduce(
            (total, item) => total + item.creditsUsed,
            0
        );

        // AI Chat requests
        const aiChatRequests = usage.filter(
            item => item.service === "AI Chat"
        ).length;

        // Resume requests
        const resumeRequests = usage.filter(
            item => item.service === "Resume Generator"
        ).length;

        res.status(200).json({
            message: "Admin statistics fetched successfully",
            totalUsers,
            totalAdmins,
            totalRequests,
            totalCreditsUsed,
            aiChatRequests,
            resumeRequests
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);

        res.status(500).json({
            message: "Failed to fetch admin statistics",
            error: error.message
        });
    }
};
const getServiceStats = async (req, res) => {
    try {
        const stats = await Usage.aggregate([
            {
                $group: {
                    _id: "$service",
                    totalRequests: {
                        $sum: 1
                    },
                    totalCreditsUsed: {
                        $sum: "$creditsUsed"
                    }
                }
            },
            {
                $sort: {
                    totalRequests: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    service: "$_id",
                    totalRequests: 1,
                    totalCreditsUsed: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Service statistics fetched successfully",
            data: stats
        });

    } catch (error) {
        console.error("Service Stats Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch service statistics"
        });
    }
};

module.exports = {
    getAdminStats,
    getServiceStats
};