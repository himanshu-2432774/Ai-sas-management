const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware");
const { getProfile } = require("../controllers/userControllers");

router.get("/profile", protect, getProfile);

module.exports = router;