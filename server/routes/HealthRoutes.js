const express = require("express");
const { getHealth } = require("../controllers/HealthController");

const router = express.Router();

router.get("/", getHealth);

module.exports = router;