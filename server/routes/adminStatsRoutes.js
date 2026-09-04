const express = require("express");

const router = express.Router();

const protect  = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getAdminStats
} = require("../controllers/adminStatsController");

router.get(
    "/stats",
    protect,
    adminOnly,
    getAdminStats
);

module.exports = router;