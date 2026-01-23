const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Rate limiter for public verification routes
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});
const { issueCertificate, getCertificates, bulkIssueCertificates, getAllCertificates, deleteCertificate, getAnalyticsData } = require("../controllers/certificateController");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { checkPlanPermission } = require("../middlewares/subscriptionMiddleware");

// Org Routes
router.post("/", auth, issueCertificate); // Single certificate - all plans
router.get("/", auth, getCertificates);
router.get("/analytics", auth, checkPlanPermission('analytics'), getAnalyticsData);
router.post("/bulk", auth, checkPlanPermission('bulkIssuance'), bulkIssueCertificates); // Bulk issue - PERMISSION CHECKED

// Master Routes (Authenticated users)
router.get("/all", auth, authorize(["SUPER_ADMIN"]), getAllCertificates);
router.delete("/:certificateId", auth, deleteCertificate);

// Public Routes
const { verifyCertificate, downloadCertificate, downloadWithoutId } = require("../controllers/certificateController");
router.get("/verify/:certificateId", publicLimiter, verifyCertificate);
router.post("/download", publicLimiter, downloadCertificate);
router.post("/download-without-id", publicLimiter, downloadWithoutId);

module.exports = router;
