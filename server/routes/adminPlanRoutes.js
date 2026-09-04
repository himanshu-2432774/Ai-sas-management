const express = require("express");

const router = express.Router();

const  protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    updateUserPlan
} = require("../controllers/adminPlanController");

router.put(
    "/users/:id/plan",
    protect,
    adminOnly,
    updateUserPlan
);

module.exports = router;