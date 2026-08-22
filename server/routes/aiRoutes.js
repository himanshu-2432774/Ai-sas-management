const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const checkCredits = require("../middleware/creditMiddleware");

router.post(
    "/generate",
    protect,
    checkCredits,
    async (req, res) => {

        res.status(200).json({
            message: "AI request allowed",
            remainingCredits: req.userData.credits
        });

    }
);

module.exports = router;