const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const cacheMiddleware = require("../middleware/cacheMiddleware");
const {
    invalidateCacheMiddleware
} = require("../middleware/cacheMiddleware");

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
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get(
    "/profile",
    protect,
    cacheMiddleware(60),
    getProfile
);

router.put(
    "/profile",
    protect,
    invalidateCacheMiddleware,
    updateProfile
);

router.put("/change-password", protect, changePassword);

router.delete(
    "/account",
    protect,
    invalidateCacheMiddleware,
    deleteAccount
);

router.put(
    "/deactivate",
    protect,
    invalidateCacheMiddleware,
    deactivateAccount
);

module.exports = router;