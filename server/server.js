const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ======================
// Global Middleware
// ======================

app.use(cors());
app.use(express.json());
// add logger
const logger = require("./middleware/loggerMiddleware");
app.use(logger);

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


// ======================
// Home Route
// ======================

app.get("/", (req, res) => {
    res.json({
        message: "AI SaaS Backend Running"
    });
});


// ======================
// Error Handler
// ======================

const errorHandler = require("./middleware/errorMiddleware");

app.use(errorHandler);




// ======================
// Server
// ======================

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Running On Port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    });