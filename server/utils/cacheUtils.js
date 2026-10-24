const { redisClient } = require("../config/redis");
const { clearUsersCache } = require("./userCacheService");

const clearUserCache = async () => {
    try {
        if (!redisClient.isReady) {
            return;
        }

        const keys =
            await redisClient.keys(
                "cache:/api/admin/users*"
            );

        if (keys.length > 0) {
            await redisClient.del(keys);
        }

        console.log(
            "Admin users cache cleared"
        );

    } catch (error) {
        console.error(
            "Cache Clear Error:",
            error.message
        );
    }
};


const clearAdminUsersCache = async () => {
    try {
        if (!redisClient.isReady) {
            console.log("Redis is not ready; cache clear skipped");
            return;
        }

        await clearUsersCache();

        console.log("Admin users cache cleared");

    } catch (error) {
        console.error("Cache invalidation error:", error.message);
    }
};


module.exports = {
    clearUserCache,
    clearAdminUsersCache
};