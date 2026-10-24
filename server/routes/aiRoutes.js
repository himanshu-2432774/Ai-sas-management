const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const checkCredits = require("../middleware/creditMiddleware.js");
const checkSubscription = require("../middleware/subscriptionMiddleware.js");
const aiRateLimiter = require("../middleware/aiRateLimiter.js");

const {
    generateAI,
    generateResume,
} = require("../controllers/aiController.js");

router.post(
    "/generate",
    aiRateLimiter,
    protect,
    checkCredits,
    checkSubscription,
    generateAI
);

router.post(
    "/resume",
    aiRateLimiter,
    protect,
    checkCredits,
    checkSubscription,
    generateResume
);

module.exports = router;