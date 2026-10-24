

const dotenv = require("dotenv");
const path = require("node:path");
dotenv.config({ path: path.resolve(__dirname, ".env") });
const validateEnv = require("./utils/validateEnv.JS");
validateEnv();
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const AppError = require("./utils/AppError");
const { connectRedis, redisClient } = require("./config/redis");
const { connectDB, closeDB } = require("./config/db");

const app = express();

// ======================
// Global Middleware
// ======================

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        exposedHeaders: ["X-Request-ID"]
    })
);

app.use(helmet());

const requestIdMiddleware = require("./middleware/requestIDMiddleware");
app.use(requestIdMiddleware);

app.use(express.json({
    limit: "10kb"
}));

const performanceMiddleware = require("./middleware/performanceMiddleware");
app.use(performanceMiddleware);

const logger = require("./middleware/loggerMiddleware");
app.use(logger);

// ======================
// Health Route
// ======================

const healthRoutes = require("./routes/HealthRoutes");
app.use("/api/health", healthRoutes);

// ======================
// Rate Limiter
// ======================

const apiLimiter = require("./middleware/rateLimiter");
app.use("/api", apiLimiter);

// ======================
// Routes
// ======================

const v1Routes = require("./routes/v1");
app.use("/api/v1", v1Routes);

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const adminUsageRoutes = require("./routes/adminUsageRoutes");
app.use("/api/admin", adminUsageRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

const usageRoutes = require("./routes/usageRoutes");
app.use("/api/usage", usageRoutes);

const adminUserRoutes = require("./routes/adminUserRoutes");
app.use("/api/admin", adminUserRoutes);

const adminStatsRoutes = require("./routes/adminStatsRoutes");
app.use("/api/admin", adminStatsRoutes);

const adminPlanRoutes = require("./routes/adminPlanRoutes");
app.use("/api/admin", adminPlanRoutes);

const auditLogRoutes = require("./routes/auditLogRoutes");
app.use("/api/admin/audit", auditLogRoutes);

const cacheHealthRoutes = require("./routes/cacheHealthRoutes");
app.use("/api/admin/cache", cacheHealthRoutes);

// ======================
// Home Route
// ======================

app.get("/", (req, res) => {
    res.json({
        message: "AI SaaS Backend Running"
    });
});

// ======================
// 404 Handler
// ======================

app.use((req, res, next) => {
    next(
        new AppError(
            `Route not found: ${req.originalUrl}`,
            404
        )
    );
});

// ======================
// Error Handler
// ======================

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

// ======================
// Server + Graceful Shutdown
// ======================

const PORT = process.env.PORT || 5000;

let server;
let isShuttingDown = false;
let startupPromise;
let shutdownPromise;

const gracefulShutdown = (signal) => {
    if (shutdownPromise) {
        console.log("Shutdown already in progress.");
        return shutdownPromise;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Starting graceful shutdown...`);

    shutdownPromise = (async () => {
        let shutdownFailed = false;

        await startupPromise;

        if (server && server.listening) {
            console.log("Closing HTTP server and waiting for active requests...");
            try {
                await new Promise((resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
                console.log("HTTP server closed.");
            } catch (error) {
                console.error("Error closing HTTP server:", error);
                shutdownFailed = true;
            }
        } else {
            console.log("HTTP server was not listening.");
        }

        console.log("Closing MongoDB connection...");
        const mongoCleanup = closeDB()
            .then(() => {
                console.log("MongoDB connection closed.");
            })
            .catch((error) => {
                console.error("Error closing MongoDB:", error);
                shutdownFailed = true;
            });

        console.log("Closing Redis client...");
        const redisCleanup = (async () => {
            if (redisClient.isOpen) {
                await redisClient.close();
                console.log("Redis client closed.");
            } else {
                console.log("Redis client was not open; nothing to close.");
            }
        })().catch((error) => {
            console.error("Error closing Redis:", error);
            shutdownFailed = true;
        });

        await Promise.all([mongoCleanup, redisCleanup]);

        if (shutdownFailed) {
            process.exitCode = 1;
        } else {
            console.log("Graceful shutdown complete.");
        }
    })();

    return shutdownPromise;
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

const startServer = async () => {
    await connectDB();

    if (isShuttingDown) {
        return;
    }

    // Preserve the existing behavior of starting HTTP while Redis connects.
    void connectRedis();

    server = app.listen(PORT);
    await new Promise((resolve, reject) => {
        const onListening = () => {
            server.removeListener("error", onError);
            console.log(`Server Running On Port ${PORT}`);
            resolve();
        };
        const onError = (error) => {
            server.removeListener("listening", onListening);
            reject(error);
        };

        server.once("listening", onListening);
        server.once("error", onError);
    });
};

startupPromise = startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
});
