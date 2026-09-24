const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true
        },

        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        details: {
            type: Object,
            default: {}
        },

        ipAddress: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({
    admin: 1,
    createdAt: -1
});

auditLogSchema.index({
    action: 1,
    createdAt: -1
});

module.exports = mongoose.model("AuditLog", auditLogSchema);