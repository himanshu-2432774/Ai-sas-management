const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");
const adminOnly = require("../middleware/adminmiddleware.js");

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require("../controllers/adminUserController");


router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);


router.get(
    "/users/:id",
    protect,
    adminOnly,
    getUserById
);


router.put(
    "/users/:id/role",
    protect,
    adminOnly,
    updateUserRole
);


router.delete(
    "/users/:id",
    protect,
    adminOnly,
    deleteUser
);


module.exports = router;