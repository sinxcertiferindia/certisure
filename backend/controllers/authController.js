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

module.exports = {
  registerOrganization,
  login,
};

