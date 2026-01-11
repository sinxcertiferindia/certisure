const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Authenticated users
router.get("/", authMiddleware, auditLogController.getAllLogs);
router.delete("/all", authMiddleware, auditLogController.clearAllLogs);
router.delete("/:logId", authMiddleware, auditLogController.deleteLog);

module.exports = router;
