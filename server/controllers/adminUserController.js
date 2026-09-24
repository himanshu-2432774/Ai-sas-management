const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const createAuditLog = require("../utils/createAuditLog");
const {
    successResponse,
    errorResponse
} = require("../utils/apiResponse");


// Get all users
const getAllUsers = async (req, res) => {
    try {
        const {
            search = "",
            role,
            plan,
            isActive,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 10
        } = req.query;

        // Pagination
        const currentPage = Math.max(Number(page), 1);

        const perPage = Math.min(
            Math.max(Number(limit), 1),
            50
        );

        const filter = {};
        filter.isDeleted = false;

        // Search by name or email
        if (search.trim()) {
            filter.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        // Role filter
        if (role) {
            filter.role = role;
        }

        // Plan filter
        if (plan) {
            filter.plan = plan;
        }

        // Active status filter
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        // Sorting
        const allowedSortFields = [
            "name",
            "email",
            "createdAt",
            "updatedAt",
            "credits"
        ];

        const selectedSortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        const sortOrder = order === "asc" ? 1 : -1;

        const sortOption = {
            [selectedSortField]: sortOrder
        };

        // Total users
        const totalUsers = await User.countDocuments(filter);

        // Get users
        const users = await User.find(filter)
            .select(
                "-password -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
            )
            .sort(sortOption)
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        // Total pages
        const totalPages = Math.ceil(
            totalUsers / perPage
        );

        return successResponse(
            res,
            200,
            "Users fetched successfully",
            {
                users,
                pagination: {
                    currentPage,
                    limit: perPage,
                    totalUsers,
                    totalPages
                },
                sorting: {
                    sortBy: selectedSortField,
                    order: order === "asc" ? "asc" : "desc"
                }
            }
        );

    } catch (error) {
        console.error("Get Users Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};
// Get single user
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        return successResponse(
            res,
            200,
            "User fetched successfully",
            user
        );

    } catch (error) {
        return errorResponse(
            res,
            500,
            "Failed to fetch user"
        );
    }
};


// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return errorResponse(res, 400, "Invalid role");
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        user.role = role;

        await user.save();
        await createAuditLog({
    admin: req.user.id,
    action: "UPDATE_USER_ROLE",
    targetUser: id,
    details: {
        oldRole,
        newRole: role
    },
    ipAddress: req.ip
});
        return successResponse(
            res,
            200,
            "User role updated successfully",
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        );

    } catch (error) {
        return errorResponse(
            res,
            500,
            "Failed to update user role"
        );
    }
};
// restore user
const restoreUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        if (!user.isDeleted) {
            return errorResponse(
                res,
                400,
                "User is not deleted"
            );
        }

        user.isDeleted = false;
        user.deletedAt = null;

        await user.save();

        await createAuditLog({
            admin: req.user.id,
            action: "RESTORE_USER",
            targetUser: id,
            details: {
                name: user.name,
                email: user.email
            },
            ipAddress: req.ip
        });

        return successResponse(
            res,
            200,
            "User restored successfully"
        );

    } catch (error) {
        console.error(
            "Restore User Error:",
            error
        );

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};
const getDeletedUsers = async (req, res) => {
    try {
        const users = await User.find({
            isDeleted: true
        })
            .select(
                "-password -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
            )
            .sort({
                deletedAt: -1
            });

        return successResponse(
            res,
            200,
            "Deleted users fetched successfully",
            users
        );

    } catch (error) {
        console.error(
            "Get Deleted Users Error:",
            error
        );

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return errorResponse(
                res,
                404,
                "User not found"
            );
        }

        if (user.role === "admin") {
            return errorResponse(
                res,
                403,
                "Admin user cannot be deleted"
            );
        }

        if (user.isDeleted) {
            return errorResponse(
                res,
                400,
                "User is already deleted"
            );
        }

        user.isDeleted = true;
        user.deletedAt = new Date();

        await user.save();

        await createAuditLog({
            admin: req.user.id,
            action: "DELETE_USER",
            targetUser: id,
            details: {
                name: user.name,
                email: user.email
            },
            ipAddress: req.ip
        });

        return successResponse(
            res,
            200,
            "User deleted successfully"
        );

    } catch (error) {
        console.error(
            "Delete User Error:",
            error
        );

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};
const bulkDeactivateUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return errorResponse(
                res,
                400,
                "userIds must be a non-empty array"
            );
        }

        const result = await User.updateMany(
            {
                _id: { $in: userIds },
                role: { $ne: "admin" }
            },
            {
                $set: {
                    isActive: false
                }
            }
        );
        await createAuditLog({
             admin: req.user.id,
            action: "BULK_DEACTIVATE_USERS",
             details: {
            userIds,
           matchedCount: result.matchedCount,
           modifiedCount: result.modifiedCount
        },
       ipAddress: req.ip
     });

        return successResponse(
            res,
            200,
            "Users deactivated successfully",
            {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        );

    } catch (error) {
        console.error("Bulk Deactivate Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};
const bulkActivateUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return errorResponse(
                res,
                400,
                "userIds must be a non-empty array"
            );
        }

        const result = await User.updateMany(
            {
                _id: { $in: userIds },
                role: { $ne: "admin" }
            },
            {
                $set: {
                    isActive: true
                }
            }
        );
        await createAuditLog({
    admin: req.user.id,
    action: "BULK_ACTIVATE_USERS",
    details: {
        userIds,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
    },
    ipAddress: req.ip
});

        return successResponse(
            res,
            200,
            "Users activated successfully",
            {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        );

    } catch (error) {
        console.error("Bulk Activate Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};
const bulkUpdatePlan = async (req, res) => {
    try {
        const { userIds, plan } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return errorResponse(
                res,
                400,
                "userIds must be a non-empty array"
            );
        }

        const allowedPlans = [
            "free",
            "basic",
            "pro"
        ];

        if (!allowedPlans.includes(plan)) {
            return errorResponse(
                res,
                400,
                "Invalid plan"
            );
        }

        const planCredits = {
            free: 10,
            basic: 50,
            pro: 100
        };

        const result = await User.updateMany(
            {
                _id: { $in: userIds },
                role: { $ne: "admin" }
            },
            {
                $set: {
                    plan: plan,
                    credits: planCredits[plan],
                    subscriptionStatus: "active",
                    subscriptionStartDate: new Date(),
                    subscriptionEndDate: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    )
                }
            }
        );
        await createAuditLog({
    admin: req.user.id,
    action: "BULK_UPDATE_PLAN",
    details: {
        userIds,
        plan,
        credits: planCredits[plan],
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
    },
    ipAddress: req.ip
});

        return successResponse(
            res,
            200,
            "Users plan updated successfully",
            {
                plan,
                credits: planCredits[plan],
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        );

    } catch (error) {
        console.error("Bulk Plan Update Error:", error);

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    bulkDeactivateUsers,
    bulkActivateUsers,
    bulkUpdatePlan,
    restoreUser,
    getDeletedUsers
};