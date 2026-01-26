const { User, Organization, AuditLog, Verification } = require("../models");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * Register new organization with admin user
 */
const registerOrganization = async (req, res) => {
  try {
    const { organization, admin } = req.body;

    // Validate input
    if (!organization || !admin) {
      return res.status(400).json({ message: "Organization and admin data required" });
    }

    // 0. Verify Email Status (CRITICAL SECURITY CHECK)
    const verificationRecord = await Verification.findOne({ email: admin.email });
    if (!verificationRecord || !verificationRecord.verified) {
      return res.status(400).json({
        message: "Email not verified. Please verify your email address before registering."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: admin.email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if organization name already exists (optional but recommended)
    /* 
    const existingOrg = await Organization.findOne({ name: organization.name });
    if (existingOrg) {
      return res.status(400).json({ message: "Organization name already exists" });
    }
    */

    // 3. Get Plan from Database
    const { Plan } = require("../models");
    const plan = await Plan.findById(organization.planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const selectedPlanName = plan.planName;
    const isPaidPlan = plan.monthlyPrice > 0;

    // Calculate subscription duration (1 year for paid plans)
    const calculateSubscriptionEndDate = (p) => {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
      return endDate;
    };

    // Determine account and payment status based on plan
    const accountStatus = isPaidPlan ? "PENDING" : "ACTIVE";
    const paymentStatus = isPaidPlan ? "PENDING" : "PAID";
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = calculateSubscriptionEndDate(plan);

    let org = null;
    let user = null;

    try {
      // Create organization first
      org = await Organization.create({
        name: organization.name,
        type: organization.type || "",
        email: admin.email, // Use admin email as org email
        subscriptionPlan: selectedPlanName,
        planId: plan._id,
        subscriptionStatus: isPaidPlan ? "TRIAL" : "ACTIVE",
        paymentStatus: paymentStatus,
        accountStatus: accountStatus,
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        startDate: new Date(),
        isActive: true,
        logo: organization.logo || null, // Logo URL or path
      });

      // Create admin user
      try {
        user = await User.create({
          orgId: org._id,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobileNumber || "",
          password: admin.password, // Will be auto-hashed by pre-save hook
          role: "ORG_ADMIN",
          isActive: true,
        });
      } catch (userError) {
        // Rollback: Delete the created organization if user creation fails
        await Organization.findByIdAndDelete(org._id);
        throw userError;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          orgId: org._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Log audit event
      await AuditLog.create({
        orgId: org._id,
        userId: user._id,
        action: "ORGANIZATION_REGISTERED",
        entityType: "ORGANIZATION",
        entityId: org._id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      // For paid plans, don't return token (user needs approval)
      // For free plans, return token for immediate login
      const responseData = {
        message: isPaidPlan
          ? "Organization registered successfully. Please complete payment to activate your account."
          : "Organization registered successfully",
        user: user.toJSON(),
        organization: org,
        requiresPayment: isPaidPlan,
      };

      // Only return token for free plans
      if (!isPaidPlan) {
        responseData.token = token;
      }

      res.status(201).json(responseData);

    } catch (innerError) {
      // Catch errors during Org/User creation sequence
      console.error("Registration sequence error:", innerError);

      // If validation error (e.g. invalid fields), return 400
      if (innerError.name === 'ValidationError') {
        return res.status(400).json({ message: innerError.message });
      }

      throw innerError; // Re-throw to outer catch for generic error handling
    }

  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      // This might catch race conditions where email was inserted just after our check
      // OR organization duplicates if unique index exists
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      return res.status(400).json({ message: "Duplicate entry detected" });
    }
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user with password and populate organization
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate('orgId');

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        message: "Account is locked. Please try again later."
      });
    }

    // Check organization account status
    const organization = await Organization.findById(user.orgId);
    if (!organization) {
      return res.status(403).json({ message: "Organization not found" });
    }

    // Verify account status before allowing login
    if (organization.accountStatus === "PENDING") {
      return res.status(403).json({
        message: "Your account is under verification. Please wait for approval."
      });
    }

    if (organization.accountStatus === "BLOCKED") {
      return res.status(403).json({
        message: "Your account is disabled. Contact support."
      });
    }

    // Only allow login if accountStatus is ACTIVE
    if (organization.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        message: "Account access denied. Please contact support."
      });
    }

    // Compare password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        orgId: user.orgId._id || user.orgId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Log audit event
    await AuditLog.create({
      orgId: user.orgId,
      userId: user._id,
      action: "LOGIN",
      entityType: "AUTH",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};


/**
 * Send OTP for Signup
 */
const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save/Update Verification
    await Verification.findOneAndUpdate(
      { email },
      { email, otp, expires, verified: false },
      { upsert: true, new: true }
    );

    // Send Email
    const message = `Your Certisure verification code is: ${otp}\n\nThis code is valid for 10 minutes.\nDo not share this code with anyone.`;

    await sendEmail({
      email,
      subject: "Email Verification Code - Certisure",
      message,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP: " + (error.message || "Internal Error") });
  }
};

/**
 * Verify OTP for Signup
 */
const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const record = await Verification.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "Invalid request. Request OTP first." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Mark verified
    record.verified = true;
    // Don't delete OTP immediately if we want to allow re-verification within session, but clearing it is safer.
    // However, if schema requires fields, we might fail validation if we set them to undefined.
    // Check schema definition: Verification.js might require otp/expires.

    // Let's check if schema has required: true for otp?
    // If so, we can't set it to undefined. Let's just keep it but mark verified.
    // checking Verification.js content again might be needed, but to be safe:
    record.otp = null;
    record.expires = null;

    // Wait, if schema says required: true, null might fail too.
    // Let's modify schema to distinct verified state or allow nulls.
    // For now, let's just set verified=true and update logic.

    await Verification.findOneAndUpdate(
      { email },
      {
        $set: { verified: true },
        $unset: { otp: 1, expires: 1 }
      }
    );

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error Detail:", error);
    res.status(500).json({ message: "Verification failed: " + error.message });
  }
};

/**
 * Send OTP for Forgot Password
 */
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.emailOtp = otp;
    user.emailOtpExpires = expires;
    await user.save();

    // Send Email
    const message = `Your Certisure password reset code is: ${otp}\n\nThis code is valid for 10 minutes.\nDo not share this code with anyone.`;

    await sendEmail({
      email,
      subject: "Password Reset Code - Certisure",
      message,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * Verify Forgot Password OTP
 */
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email }).select("+emailOtp +emailOtpExpires"); // Need to select hidden fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.emailOtpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Generate a temporary reset token
    // We can use JWT for this, specific for password reset
    const resetToken = jwt.sign(
      { userId: user._id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // We verified the OTP, so clear it
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    user.emailVerified = true; // Ensure confirmed
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified",
      resetToken
    });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "password_reset") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword; // Pre-save hook will hash it
    // Reset login attempts/lockout if any
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = {
  registerOrganization,
  login,
  sendSignupOtp,
  verifySignupOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};

