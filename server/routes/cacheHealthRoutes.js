const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getCacheHealth
} = require("../controllers/cacheHealthController");

router.get(
    "/health",
    protect,
    adminOnly,
    getCacheHealth
);

module.exports = router;