const express = require("express");
const router = express.Router();
const { registerOrganization, login } = require("../controllers/authController");

router.post("/register-org", registerOrganization);
router.post("/login", login);

// Signup OTP Routes
router.post("/send-signup-otp", require("../controllers/authController").sendSignupOtp);
router.post("/verify-signup-otp", require("../controllers/authController").verifySignupOtp);

// Forgot Password OTP Routes
router.post("/forgot-password", require("../controllers/authController").sendForgotPasswordOtp);
router.post("/verify-reset-otp", require("../controllers/authController").verifyForgotPasswordOtp);
router.post("/reset-password", require("../controllers/authController").resetPassword);

module.exports = router;

