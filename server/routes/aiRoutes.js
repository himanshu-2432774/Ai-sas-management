const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const checkCredits = require("../middleware/creditmiddleware.js");
const checkSubscription = require("../middleware/subscriptionMiddleware.js");
const aiRateLimiter = require("../middleware/airateLimiter.js");

const {
    generateAI,
    generateResume,
} = require("../controllers/aiController.js");

router.post(
    "/generate",
    aiRateLimiter,
    protect,
    checkSubscription,
    checkCredits,
    generateAI
);

router.post(
    "/resume",
    aiRateLimiter,
    protect,
    checkSubscription,
    checkCredits,
    generateResume
);

module.exports = router;