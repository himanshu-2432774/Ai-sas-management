const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getAuditLogs
} = require("../controllers/auditLogController");

router.get(
    "/logs",
    protect,
    adminOnly,
    getAuditLogs
);

module.exports = router;