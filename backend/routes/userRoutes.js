const express = require("express");
const router = express.Router();
const { getCurrentUser, getAllUsers, createSuperAdmin } = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Get current logged-in user details
router.get("/me", auth, getCurrentUser);

// Get all users (Master Dashboard)
router.get("/", auth, authorize(["SUPER_ADMIN", "ORG_ADMIN", "admin"]), getAllUsers);

// Create Master Admin
router.post("/super-admin", auth, authorize(["SUPER_ADMIN", "ORG_ADMIN", "admin"]), createSuperAdmin);

module.exports = router;
