const User = require("../models/User");

const checkCredits = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.credits <= 0) {
            return res.status(403).json({
                message: "No credits remaining"
            });
        }

        req.userData = user;

        next();

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = checkCredits;