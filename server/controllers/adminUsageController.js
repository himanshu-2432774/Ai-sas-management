const Usage = require("../models/Usage");

const getAllUsage = async (req, res) => {
    try {
        const usage = await Usage.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All usage records fetched successfully",
            count: usage.length,
            usage
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch usage records",
            error: error.message
        });
    }
};

module.exports = {
    getAllUsage
};