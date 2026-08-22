const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
    getAllUsers
} = require("../controllers/adminControllers");

router.get(
    "/users",
    protect,
    authorize("admin"),
    getAllUsers
);

module.exports = router;