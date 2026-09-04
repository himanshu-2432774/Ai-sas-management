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

module.exports = {
    getMyUsage
};