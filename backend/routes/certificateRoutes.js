const express = require("express");
const router = express.Router();
const { issueCertificate, getCertificates, bulkIssueCertificates, getAllCertificates, deleteCertificate } = require("../controllers/certificateController");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { requirePaidPlan } = require("../middlewares/subscriptionMiddleware");

// Org Routes
router.post("/", auth, issueCertificate); // Single certificate - all plans
router.get("/", auth, getCertificates);
router.post("/bulk", auth, requirePaidPlan, bulkIssueCertificates); // Bulk issue - PAID PLANS ONLY

// Master Routes (Authenticated users)
router.get("/all", auth, getAllCertificates);
router.delete("/:certificateId", auth, deleteCertificate);

// Public Routes
const { verifyCertificate } = require("../controllers/certificateController");
router.get("/verify/:certificateId", verifyCertificate);

module.exports = router;
