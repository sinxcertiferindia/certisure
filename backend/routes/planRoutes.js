const express = require("express");
const router = express.Router();
const { getPlans, updatePlan, getPlanAnalytics } = require("../controllers/planController");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// All routes protected - analytics and view available to all authenticated users
router.get("/", getPlans);
router.get("/analytics", auth, authorize(["SUPER_ADMIN", "ORG_ADMIN", "admin"]), getPlanAnalytics);

// Update plan - SUPER_ADMIN (and ORG_ADMIN for testing)
router.put("/:planName", auth, authorize(["SUPER_ADMIN", "ORG_ADMIN", "admin"]), updatePlan);

module.exports = router;
