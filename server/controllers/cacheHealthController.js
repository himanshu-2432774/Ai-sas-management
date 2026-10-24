const { redisClient } = require("../config/redis");
const { getCacheMetrics } = require("../utils/cacheMetrics");
const {
    successResponse,
    errorResponse
} = require("../utils/apiResponse");

const getCacheHealth = async (req, res) => {
    try {
        const redisConnected = redisClient.isReady;

        return successResponse(
            res,
            200,
            "Cache health fetched successfully",
            {
                redis: {
                    connected: redisConnected,
                    status: redisConnected ? "ready" : "unavailable"
                },
                metrics: getCacheMetrics()
            }
        );
    } catch (error) {
        console.error("Cache Health Error:", error.message);

        return errorResponse(
            res,
            500,
            "Unable to fetch cache health"
        );
    }
};

module.exports = {
    getCacheHealth
};