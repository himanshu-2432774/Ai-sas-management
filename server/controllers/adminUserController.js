const User = require("../models/User");


// Get all users
const getAllUsers = async (req, res) => {
    try {
        const {
            search = "",
            role,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (page - 1) * limit;

        const filter = {};

        // Search by name or email
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by role
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const totalUsers = await User.countDocuments(filter);

        res.status(200).json({
            message: "Users fetched successfully",
            totalUsers,
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / limit),
            users
        });

    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};
// Get single user
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};


// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update user role",
            error: error.message
        });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
};