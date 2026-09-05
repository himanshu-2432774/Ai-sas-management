const express = require("express");
const router = express.Router();
const checkSubscription = require("../middleware/subscriptionMiddleware");

const protect = require("../middleware/authmiddleware.js");
const checkCredits = require("../middleware/creditMiddleware");

const {
    generateAI,
    generateResume
} = require("../controllers/aicontrollers");

router.post(
    "/generate",
    protect,
    checkCredits,
    checkSubscription,
    generateAI
);

router.post(
    "/resume",
    protect,
    checkCredits,
    checkSubscription,
    generateResume
);

module.exports = router;