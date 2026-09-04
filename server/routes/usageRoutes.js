const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getMyUsage,
    getUsageStats
} = require("../controllers/usageController");

router.get(
    "/",
    protect,
    getMyUsage
);

router.get(
    "/stats",
    protect,
    getUsageStats
);

module.exports = router;