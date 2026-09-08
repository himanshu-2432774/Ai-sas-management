const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // Subscription Plan
        plan: {
            type: String,
            enum: ["free", "basic", "pro"],
            default: "free"
        },

        // User Credits
        credits: {
            type: Number,
            default: 10
        },

        // Subscription Status
        subscriptionStatus: {
            type: String,
            enum: ["active", "expired"],
            default: "active"
        },

        // Subscription Start Date
        subscriptionStartDate: {
            type: Date,
            default: Date.now
        },

        // Subscription End Date
        subscriptionEndDate: {
            type: Date,
            default: null
        },

        // Email Verification
        isVerified: {
            type: Boolean,
            default: false
        },

        emailVerificationToken: {
            type: String,
            default: null
        },

        emailVerificationExpire: {
            type: Date,
            default: null
        },

        // Password Reset
        resetPasswordToken: {
            type: String,
            default: null
        },

        resetPasswordExpire: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);