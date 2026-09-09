const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");

const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/userControllers");

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);
router.delete(
    "/account",
    protect,
    deleteAccount
);

module.exports = router;