const {
    redisClient
} = require("../config/redis");

const cacheMiddleware = (duration = 60) => {
    return async (req, res, next) => {
        try {
            if (!redisClient.isReady) {
                return next();
            }

            const key = `cache:${req.originalUrl}`;

            const cachedData =
                await redisClient.get(key);

            if (cachedData) {
                console.log("Redis Cache HIT:", key);

                return res.status(200).json(
                    JSON.parse(cachedData)
                );
            }

            console.log("Redis Cache MISS:", key);

            const originalJson = res.json.bind(res);

            res.json = async (data) => {
                try {
                    await redisClient.setEx(
                        key,
                        duration,
                        JSON.stringify(data)
                    );
                } catch (error) {
                    console.error(
                        "Redis Cache Save Error:",
                        error.message
                    );
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

module.exports = cacheMiddleware;