const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getAllUsage
} = require("../controllers/adminUsageController");

router.get(
    "/usage",
    protect,
    adminOnly,
    getAllUsage
);

module.exports = router;