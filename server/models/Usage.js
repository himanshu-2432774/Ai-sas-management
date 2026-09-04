const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service: {
            type: String,
            required: true
        },

        prompt: {
            type: String,
            required: true
        },

        response: {
            type: String,
            required: true
        },

        creditsUsed: {
            type: Number,
            default: 1
        },

        status: {
            type: String,
            enum: ["success", "failed"],
            default: "success"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Usage", usageSchema);