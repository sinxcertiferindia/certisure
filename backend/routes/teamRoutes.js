const express = require("express");
const router = express.Router();
const { createTeamMember, getTeamMembers } = require("../controllers/teamController");
const auth = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(auth);

// Get team members list
router.get("/list", getTeamMembers);

// Create new team member
router.post("/create", createTeamMember);

module.exports = router;

