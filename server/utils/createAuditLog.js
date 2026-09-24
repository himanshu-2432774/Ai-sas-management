const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
    admin,
    action,
    targetUser = null,
    details = {},
    ipAddress = null
}) => {
    try {
        await AuditLog.create({
            admin,
            action,
            targetUser,
            details,
            ipAddress
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
};

module.exports = createAuditLog;