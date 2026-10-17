const {
    redisClient
} = require("../config/redis");

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

module.exports = {
    clearUserCache
};