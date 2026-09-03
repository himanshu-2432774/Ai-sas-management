const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authmiddleware");
const checkCredits = require("../middleware/creditMiddleware");
const { generateAI } = require("../controllers/aiController");

router.post(
    "/generate",
    protect,
    checkCredits,
    generateAI
);

module.exports = router;