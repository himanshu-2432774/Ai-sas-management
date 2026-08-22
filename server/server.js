const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AI SaaS Backend Running"
    });
});

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
app.use(express.json());
const authRoutes=require("./routes/authRoutes");
app.use(express.json());

app.use("/api/auth",authRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);