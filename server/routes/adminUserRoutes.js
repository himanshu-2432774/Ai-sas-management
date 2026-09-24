const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    bulkDeactivateUsers,
    bulkActivateUsers,
    bulkUpdatePlan
} = require("../controllers/adminUserController");
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get users with search, filtering, sorting and pagination
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *         description: Filter users by role
 *
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *           enum:
 *             - free
 *             - basic
 *             - pro
 *         description: Filter users by subscription plan
 *
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter users by account status
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - email
 *             - createdAt
 *             - updatedAt
 *             - credits
 *           default: createdAt
 *         description: Field used for sorting
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: desc
 *         description: Sorting order
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of users per page
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);


/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *
 *     responses:
 *       200:
 *         description: User fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    "/users/:id",
    protect,
    adminOnly,
    getUserById
);




router.delete(
    "/users/:id",
    protect,
    adminOnly,
    deleteUser
);
/**
 * @swagger
 * /api/admin/users/bulk/deactivate:
 *   put:
 *     summary: Deactivate multiple users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users deactivated successfully
 *       400:
 *         description: Invalid user IDs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.put(
    "/users/bulk/deactivate",
    protect,
    adminOnly,
    bulkDeactivateUsers
);
/**
 * @swagger
 * /api/admin/users/bulk/activate:
 *   put:
 *     summary: Activate multiple users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users activated successfully
 *       400:
 *         description: Invalid user IDs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */

router.put(
    "/users/bulk/activate",
    protect,
    adminOnly,
    bulkActivateUsers
);

router.put(
    "/users/bulk/plan",
    protect,
    adminOnly,
    bulkUpdatePlan
);
router.put(
    "/users/:id/role",
    protect,
    adminOnly,
    updateUserRole
);




module.exports = router;