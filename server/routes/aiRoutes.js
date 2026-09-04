const express = require("express");
const router = express.Router();

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
    generateAI
);

router.post(
    "/resume",
    protect,
    checkCredits,
    generateResume
);

module.exports = router;