const Usage = require("../models/Usage");

const getMyUsage = async (req, res) => {
    try {
        const usage = await Usage.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Usage history fetched successfully",
            count: usage.length,
            usage
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch usage history",
            error: error.message
        });
    }
};
const getUsageStats = async (req, res) => {
    try {
        const usage = await Usage.find({
            user: req.user.id
        });

        const totalRequests = usage.length;

        const totalCreditsUsed = usage.reduce(
            (total, item) => total + item.creditsUsed,
            0
        );

        const aiChatRequests = usage.filter(
            item => item.service === "AI Chat"
        ).length;

        const resumeRequests = usage.filter(
            item => item.service === "Resume Generator"
        ).length;

        res.status(200).json({
            message: "Usage statistics fetched successfully",
            totalRequests,
            totalCreditsUsed,
            aiChatRequests,
            resumeRequests
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch usage statistics",
            error: error.message
        });
    }
};

module.exports = {
    getMyUsage,
    getUsageStats
};