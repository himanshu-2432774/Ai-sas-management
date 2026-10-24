const mongoose = require("mongoose");

const getHealth = (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  const health = {
    status: dbConnected ? "healthy" : "unhealthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbConnected ? "connected" : "disconnected",
  };

  return res.status(dbConnected ? 200 : 503).json(health);
};

module.exports = { getHealth };