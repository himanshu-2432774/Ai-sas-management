const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware.js");

const authorize = require("../middleware/roleMiddleware");
const cacheMiddleware = require("../middleware/cacheMiddleware");

const {
    getAllUsers
} = require("../controllers/adminUserController");

router.get(
    "/users",
    protect,
    authorize("admin"),
    cacheMiddleware(60),
    getAllUsers
);

module.exports = router;