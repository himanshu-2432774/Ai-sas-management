const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL,
    disableOfflineQueue: true,
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
            const delay = Math.min(500 * (2 ** retries), 30000);
            return delay + Math.floor(Math.random() * 250);
        }
    }
});

redisClient.on("error", (error) => {
    console.error(
        "Redis Error:",
        error.code ? `${error.code}: ${error.message}` : error.message
    );
});

const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn(
            "REDIS_URL is not configured; Redis caching is disabled."
        );
        return;
    }

    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        console.log("Redis Connected Successfully");
    } catch (error) {
        console.error(
            "Redis Connection Error:",
            error.message
        );
    }
};

module.exports = {
    redisClient,
    connectRedis
};
