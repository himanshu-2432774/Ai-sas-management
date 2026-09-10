const express = require("express");

const router = express.Router();

const { getProfile } = require("../../controllers/userControllers.js");
const protect = require("../../middleware/authmiddleware.js");

router.get("/profile", protect, getProfile);

module.exports = router;