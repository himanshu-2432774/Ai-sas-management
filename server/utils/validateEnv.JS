const validateEnv = () => {
    const requiredVars = [
        "MONGO_URI",
        "JWT_SECRET",
        "FRONTEND_URL",
        "REDIS_URL"
    ];

    const missingVars = requiredVars.filter((key) => {
        return !process.env[key] || process.env[key].trim() === "";
    });

    if (missingVars.length > 0) {
        console.error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        );

        throw new Error("Environment configuration is incomplete.");
    }

    console.log("Environment configuration validated.");
};

module.exports = validateEnv;