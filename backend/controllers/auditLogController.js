const { AuditLog } = require("../models");

/**
 * Get all audit logs
 */
const getAllLogs = async (req, res) => {
    try {
        const { orgId, action } = req.query;
        const filter = {};
        if (orgId) filter.orgId = orgId;
        if (action) filter.action = action;

        const logs = await AuditLog.find(filter)
            .populate("orgId", "name")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 for performance

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch audit logs"
        });
    }
};

/**
 * Delete a log
 */
const deleteLog = async (req, res) => {
    try {
        const { logId } = req.params;
        await AuditLog.findByIdAndDelete(logId);
        res.json({ success: true, message: "Log deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete log" });
    }
};

/**
 * Clear all logs (Maintenance)
 */
const clearAllLogs = async (req, res) => {
    try {
        await AuditLog.deleteMany({});
        res.json({ success: true, message: "All logs cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to clear logs" });
    }
};

module.exports = {
    getAllLogs,
    deleteLog,
    clearAllLogs
};
