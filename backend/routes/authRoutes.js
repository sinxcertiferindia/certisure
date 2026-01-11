const express = require("express");
const router = express.Router();
const { registerOrganization, login } = require("../controllers/authController");

router.post("/register-org", registerOrganization);
router.post("/login", login);

module.exports = router;

