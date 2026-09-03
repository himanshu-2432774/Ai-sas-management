const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const checkCredits = require("../middleware/creditMiddleware");

router.post(
    "/generate",
    protect,
    checkCredits,
    async (req, res) => {

        req.userData.credits -= 1;

        await req.userData.save();

        res.status(200).json({
            message: "AI request successful",
            remainingCredits: req.userData.credits
        });

    }
);

module.exports = router;