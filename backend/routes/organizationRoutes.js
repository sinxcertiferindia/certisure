const express = require("express");
const router = express.Router();
const {
  getOrganizationProfile,
  updateOrganizationProfile,
  getAllOrganizations,
  approveOrganization,
  blockOrganization,
  deactivateSubscription,
  deleteOrganization,
  getOrganizationDetails
} = require("../controllers/organizationController");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/profile", auth, getOrganizationProfile);
router.put("/profile", auth, updateOrganizationProfile);

// Master Dashboard routes (Authenticated users)
router.get("/all", auth, getAllOrganizations);
router.post("/:orgId/approve", auth, approveOrganization);
router.post("/:orgId/block", auth, blockOrganization);
router.post("/:orgId/deactivate", auth, deactivateSubscription);
router.get("/:orgId", auth, getOrganizationDetails);
router.delete("/:orgId", auth, deleteOrganization);
router.post("/:orgId/restart", auth, require("../controllers/organizationController").restartSubscription);

module.exports = router;

