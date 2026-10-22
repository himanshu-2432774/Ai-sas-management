const { redisClient } = require("../config/redis");

const USERS_CACHE_PREFIX = "cache:admin-users:";
const CACHE_TTL = 60;

const getUsersCacheKey = (query) => {
    // Sort query keys so equivalent query params use same key
    const normalizedQuery = Object.keys(query)
        .sort()
        .map((key) => `${key}=${query[key]}`)
        .join("&");

    return `${USERS_CACHE_PREFIX}${normalizedQuery || "all"}`;
};

const getCachedUsers = async (key) => {
    if (!redisClient.isReady) {
        recordCacheError();
        return null;
    }

    try {
        const cachedData = await redisClient.get(key);

        if (cachedData) {
            recordCacheHit();
            return JSON.parse(cachedData);
        }

        recordCacheMiss();
        return null;
    } catch (error) {
        recordCacheError();
        throw error;
    }
};

const setCachedUsers = async (key, data) => {
    if (!redisClient.isReady) {
        recordCacheError();
        return;
    }

    try {
        await redisClient.setEx(
            key,
            CACHE_TTL,
            JSON.stringify(data)
        );
    } catch (error) {
        recordCacheError();
        throw error;
    }
};

const clearUsersCache = async () => {
    if (!redisClient.isReady) {
        return;
    }

    let cursor = "0";

    do {
        const result = await redisClient.scan(cursor, {
            MATCH: `${USERS_CACHE_PREFIX}*`,
            COUNT: 100
        });

        cursor = result.cursor;

        if (result.keys.length > 0) {
            await redisClient.del(result.keys);
        }
    } while (cursor !== "0");
};
const {
    recordCacheHit,
    recordCacheMiss,
    recordCacheError
} = require("./cacheMetrics");

module.exports = {
    getUsersCacheKey,
    getCachedUsers,
    setCachedUsers,
    clearUsersCache
};