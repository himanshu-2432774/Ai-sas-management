const User = require("../models/User");

const updateUserPlan = async (req, res) => {
    try {
        const { plan } = req.body;

        const planCredits = {
            free: 10,
            basic: 50,
            pro: 100
        };

        if (!planCredits.hasOwnProperty(plan)) {
            return res.status(400).json({
                message: "Invalid plan"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.plan = plan;
        user.credits = planCredits[plan];

        await user.save();

        res.status(200).json({
            message: "User plan updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error("Plan Update Error:", error);

        res.status(500).json({
            message: "Failed to update user plan",
            error: error.message
        });
    }
};

module.exports = {
    updateUserPlan
}; 