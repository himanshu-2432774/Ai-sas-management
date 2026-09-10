const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");

const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    deactivateAccount
} = require("../controllers/userControllers");
/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);
router.delete(
    "/account",
    protect,
    deleteAccount
);
router.put(
    "/deactivate",
    protect,
    deactivateAccount
); 

module.exports = router;