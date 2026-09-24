const AuditLog = require("../models/AuditLog");
const {
    successResponse,
    errorResponse
} = require("../utils/apiResponse");

const getAuditLogs = async (req, res) => {
    try {
        const {
            action,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(
            Number(page),
            1
        );

        const perPage = Math.min(
            Math.max(Number(limit), 1),
            50
        );

        const filter = {};

        if (action) {
            filter.action = action;
        }

        const totalLogs = await AuditLog.countDocuments(
            filter
        );

        const logs = await AuditLog.find(filter)
            .populate(
                "admin",
                "name email role"
            )
            .populate(
                "targetUser",
                "name email role"
            )
            .sort({
                createdAt: -1
            })
            .skip(
                (currentPage - 1) * perPage
            )
            .limit(perPage);

        const totalPages = Math.ceil(
            totalLogs / perPage
        );

        return successResponse(
            res,
            200,
            "Audit logs fetched successfully",
            {
                logs,
                pagination: {
                    currentPage,
                    limit: perPage,
                    totalLogs,
                    totalPages
                }
            }
        );

    } catch (error) {
        console.error(
            "Get Audit Logs Error:",
            error
        );

        return errorResponse(
            res,
            500,
            "Server error"
        );
    }
};

module.exports = {
    getAuditLogs
};