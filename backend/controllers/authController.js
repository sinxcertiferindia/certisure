const { User, Organization, AuditLog } = require("../models");
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

    // Map plan type to subscription plan
    const planMap = {
      free: "FREE",
      pro: "PRO",
      enterprise: "ENTERPRISE"
    };

    // Create organization
    const org = await Organization.create({
      name: organization.name,
      type: organization.organizationType || "",
      email: admin.email, // Use admin email as org email
      subscriptionPlan: planMap[organization.plan] || "FREE",
      subscriptionStatus: "ACTIVE",
      startDate: new Date(),
      isActive: true,
    });

    // Create admin user
    const user = await User.create({
      orgId: org._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobileNumber || "",
      password: admin.password, // Will be auto-hashed by pre-save hook
      role: "ORG_ADMIN",
      isActive: true,
    });

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

    res.status(201).json({
      message: "Organization registered successfully",
      token,
      user: user.toJSON(),
      organization: org,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
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

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: "Account is locked. Please try again later." 
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
        orgId: user.orgId, 
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

module.exports = {
  registerOrganization,
  login,
};

