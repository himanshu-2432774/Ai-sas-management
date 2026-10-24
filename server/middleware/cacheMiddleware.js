const {
    redisClient
} = require("../config/redis");

const getCacheKey = (req, url = req.originalUrl) => {
    const userId = req.user && req.user.id
        ? req.user.id
        : "anonymous";

    return `cache:${url}:${userId}`;
};

const getCacheLogLabel = (req) =>
    `cache:${req.baseUrl}${req.path}`;

const cacheMiddleware = (duration = 60) => {
    return async (req, res, next) => {
        try {
            if (!redisClient.isReady) {
                console.log(
                    "Redis Cache BYPASS: Redis is not ready for",
                    req.originalUrl
                );
                return next();
            }

            const key = getCacheKey(req);

            const cachedData =
                await redisClient.get(key);

            if (cachedData) {
                console.log(
                    "Redis Cache HIT:",
                    getCacheLogLabel(req)
                );

                return res.status(200).json(
                    JSON.parse(cachedData)
                );
            }

            console.log(
                "Redis Cache MISS:",
                getCacheLogLabel(req)
            );

            const originalJson = res.json.bind(res);

            res.json = (data) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const savePromise = redisClient.setEx(
                            key,
                            duration,
                            JSON.stringify(data)
                        );
                        savePromise.catch((error) => {
                            console.error(
                                "Redis Cache Save Error:",
                                error.message
                            );
                        });
                    } catch (error) {
                        console.error(
                            "Redis Cache Save Error:",
                            error.message
                        );
                    }
                }

                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error(
                "Cache Middleware Error:",
                error.message
            );

            next();
        }
    };
};

const invalidateCacheMiddleware = async (req, res, next) => {
    if (!redisClient.isReady) {
        return next();
    }

    try {
        await redisClient.del(
            getCacheKey(req, `${req.baseUrl}/profile`)
        );
    } catch (error) {
        console.error(
            "Redis Cache Invalidation Error:",
            error.message
        );
    }

    next();
};

module.exports = cacheMiddleware;
module.exports.invalidateCacheMiddleware = invalidateCacheMiddleware;