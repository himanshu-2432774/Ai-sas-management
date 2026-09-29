const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

const connectRedis = async () => {
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