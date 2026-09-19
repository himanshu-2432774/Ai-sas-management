const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware");
const adminOnly = require("../middleware/adminmiddleware");

const {
    getAdminStats,
    getServiceStats
} = require("../controllers/adminStatsController");

router.get(
    "/stats",
    protect,
    adminOnly,
    getAdminStats
);

router.get(
    "/stats/services",
    protect,
    adminOnly,
    getServiceStats
);

module.exports = router;