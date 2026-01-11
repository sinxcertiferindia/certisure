const { User, Organization } = require("../models");
const { AuditLog } = require("../models");

/**
 * Get team member limits based on subscription plan
 */
const getTeamMemberLimit = (plan) => {
  switch (plan) {
    case "PRO":
      return 4;
    case "ENTERPRISE":
      return 8;
    default:
      return 0; // FREE plan has no team members
  }
};

/**
 * Create a new team member
 * Only ORG_ADMIN can create team members
 */
const createTeamMember = async (req, res) => {
  try {
    const { name, email, password, post } = req.body;
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    // Check if user is ORG_ADMIN
    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role !== "ORG_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only organization administrators can create team members",
      });
    }

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Get organization to check subscription plan
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check if organization account is active
    if (organization.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Organization account is not active",
      });
    }

    // Get team member limit based on plan
    const maxTeamMembers = getTeamMemberLimit(organization.subscriptionPlan);

    if (maxTeamMembers === 0) {
      return res.status(403).json({
        success: false,
        message: "Team members are not available for your current plan",
      });
    }

    // Count existing team members (excluding ORG_ADMIN)
    const existingTeamMembers = await User.countDocuments({
      orgId: orgId,
      role: "TEAM_MEMBER",
      isActive: true,
    });

    // Check if limit reached
    if (existingTeamMembers >= maxTeamMembers) {
      return res.status(403).json({
        success: false,
        message: `Team member limit reached for your plan. Maximum ${maxTeamMembers} team members allowed.`,
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create new team member
    const teamMember = await User.create({
      orgId: orgId,
      name: name,
      email: email.toLowerCase(),
      password: password, // Will be auto-hashed by pre-save hook
      role: "TEAM_MEMBER",
      post: post || "",
      isActive: true,
    });

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: userId,
      action: "TEAM_MEMBER_CREATED",
      entityType: "USER",
      entityId: teamMember._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: teamMember.toJSON(),
    });
  } catch (error) {
    console.error("Create team member error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create team member",
    });
  }
};

/**
 * Get all team members for the organization
 * Only ORG_ADMIN can view team members
 */
const getTeamMembers = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    // Check if user is ORG_ADMIN
    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role !== "ORG_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only organization administrators can view team members",
      });
    }

    // Get organization to check subscription plan
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get team members (excluding ORG_ADMIN)
    const teamMembers = await User.find({
      orgId: orgId,
      role: "TEAM_MEMBER",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    // Get team member limit
    const maxTeamMembers = getTeamMemberLimit(organization.subscriptionPlan);
    const currentCount = teamMembers.length;

    res.json({
      success: true,
      data: {
        teamMembers,
        organization: {
          name: organization.name,
          subscriptionPlan: organization.subscriptionPlan,
          maxTeamMembers,
          currentCount,
        },
      },
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch team members",
    });
  }
};

module.exports = {
  createTeamMember,
  getTeamMembers,
};

