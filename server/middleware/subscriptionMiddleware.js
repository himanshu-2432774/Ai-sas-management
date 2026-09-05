const checkSubscription = async (req, res, next) => {
    try {
        const user = req.userData;

        if (!user) {
            return res.status(404).json({
                message: "User data not found"
            });
        }

        if (
            user.subscriptionEndDate &&
            new Date() > user.subscriptionEndDate
        ) {
            user.subscriptionStatus = "expired";

            await user.save();

            return res.status(403).json({
                message: "Subscription expired"
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            message: "Subscription check failed",
            error: error.message
        });
    }
};

module.exports = checkSubscription;