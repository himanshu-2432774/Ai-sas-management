const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMyUsage } = require("../controllers/usageController");

router.get(
    "/",
    protect,
    getMyUsage
);

module.exports = router;