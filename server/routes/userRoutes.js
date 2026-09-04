const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");

const {
    getProfile,
    updateProfile
} = require("../controllers/userControllers");

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

module.exports = router;