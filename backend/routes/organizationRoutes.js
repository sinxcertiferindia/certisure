const express = require("express");
const router = express.Router();
const { getOrganizationProfile } = require("../controllers/organizationController");
const auth = require("../middlewares/authMiddleware");

router.get("/profile", auth, getOrganizationProfile);

module.exports = router;

