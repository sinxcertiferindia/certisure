const { Organization, AuditLog, Plan } = require("../models");

/**
 * Get organization profile (Dynamic Plan Data)
 */
const getOrganizationProfile = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const organization = await Organization.findById(orgId)
      .select("name type email subscriptionPlan subscriptionStatus logo planId")
      .populate("planId");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Extract permissions from the populated planId
    const permissions = organization.planId?.permissions || {};

    res.json({
      success: true,
      data: {
        ...organization.toObject(),
        permissions: permissions
      }
    });
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization"
    });
  }
};

/**
 * Get all organizations (Master Dashboard) with certificate counts
 */
const getAllOrganizations = async (req, res) => {
  try {
    // TODO: Add SUPER_ADMIN check middleware
    const organizations = await Organization.find({})
      .select("name email subscriptionPlan paymentStatus accountStatus subscriptionStartDate subscriptionEndDate createdAt planId")
      .populate("planId", "planName monthlyPrice")
      .sort({ createdAt: -1 });

    // Get certificate counts for each organization
    const Certificate = require("../models/Certificate");
    const orgsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const certificateCount = await Certificate.countDocuments({ orgId: org._id });
        return {
          ...org.toObject(),
          certificatesIssued: certificateCount
        };
      })
    );

    res.json({
      success: true,
      data: orgsWithCounts
    });
  } catch (error) {
    console.error("Get all organizations error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organizations"
    });
  }
};

/**
 * Get full organization details (Master Dashboard)
 */
const getOrganizationDetails = async (req, res) => {
  try {
    const { orgId } = req.params;
    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Fetch related stats
    const usersCount = await require("../models/User").countDocuments({ orgId });
    const certificatesCount = await require("../models/Certificate").countDocuments({ orgId });
    const templatesCount = await require("../models/CertificateTemplate").countDocuments({ orgId });

    // Fetch recent certificates (limit 5)
    const recentCertificates = await require("../models/Certificate").find({ orgId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        ...organization.toObject(),
        stats: {
          usersCount,
          certificatesCount,
          templatesCount
        },
        recentCertificates
      }
    });
  } catch (error) {
    console.error("Get organization details error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization details"
    });
  }
};

/**
 * Approve organization account
 */
const approveOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Calculate subscription end date (1 year from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

    // Update organization
    organization.accountStatus = "ACTIVE";
    organization.paymentStatus = "PAID";
    organization.subscriptionStatus = "ACTIVE";
    organization.subscriptionStartDate = new Date();
    organization.subscriptionEndDate = subscriptionEndDate;
    organization.isActive = true;

    await organization.save();

    // Log audit event
    await AuditLog.create({
      orgId: organization._id,
      userId: req.user?.userId || null,
      action: "ORGANIZATION_APPROVED",
      entityType: "ORGANIZATION",
      entityId: organization._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Organization approved successfully",
      data: organization
    });
  } catch (error) {
    console.error("Approve organization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve organization"
    });
  }
};

/**
 * Block organization account
 */
const blockOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    organization.accountStatus = "BLOCKED";
    organization.isActive = false;

    await organization.save();

    // Log audit event
    await AuditLog.create({
      orgId: organization._id,
      userId: req.user?.userId || null,
      action: "ORGANIZATION_BLOCKED",
      entityType: "ORGANIZATION",
      entityId: organization._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Organization blocked successfully",
      data: organization
    });
  } catch (error) {
    console.error("Block organization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to block organization"
    });
  }
};

/**
 * Deactivate organization subscription
 */
const deactivateSubscription = async (req, res) => {
  try {
    const { orgId } = req.params;
    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    organization.subscriptionEndDate = new Date();
    organization.accountStatus = "BLOCKED";
    organization.subscriptionStatus = "CANCELLED";
    organization.isActive = false;

    await organization.save();

    // Log audit event
    await AuditLog.create({
      orgId: organization._id,
      userId: req.user?.userId || null,
      action: "SUBSCRIPTION_DEACTIVATED",
      entityType: "ORGANIZATION",
      entityId: organization._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Subscription deactivated successfully",
      data: organization
    });
  } catch (error) {
    console.error("Deactivate subscription error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate subscription"
    });
  }
};

/**
 * Delete organization and all related data
 */
const deleteOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Cascade delete - order matters less here but good practice
    // 1. Delete all users
    await require("../models/User").deleteMany({ orgId });

    // 2. Delete all certificates
    await require("../models/Certificate").deleteMany({ orgId });

    // 3. Delete all templates
    await require("../models/CertificateTemplate").deleteMany({ orgId });

    // 4. Delete all audit logs
    await AuditLog.deleteMany({ orgId });

    // 5. Finally delete the organization
    await Organization.findByIdAndDelete(orgId);

    // Log this action (system level log or master admin log)
    // We can't link it to the org since it's gone, so maybe just global log or keep orgId as string
    await AuditLog.create({
      orgId: null, // Org is deleted
      userId: req.user?.userId || null,
      action: "ORGANIZATION_DELETED",
      entityType: "ORGANIZATION",
      entityId: orgId, // Keep ID for reference
      details: { name: organization.name, email: organization.email },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Organization and all related data deleted successfully"
    });
  } catch (error) {
    console.error("Delete organization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete organization"
    });
  }
};

/**
 * Update organization profile (including logo)
 */
const updateOrganizationProfile = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { name, type, logo } = req.body;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Update fields if provided
    if (name) organization.name = name;
    if (type) organization.type = type;

    // Handle logo upload - store as base64 data URL or file path
    if (logo) {
      // Logo can be a base64 string or URL
      // For now, we'll store it directly
      // In production, you'd want to:
      // 1. Validate image format and size
      // 2. Resize/optimize the image
      // 3. Store in cloud storage (S3, Cloudinary, etc.)
      // 4. Save the URL to database
      organization.logo = logo;
    }

    await organization.save();

    // Log audit event
    await AuditLog.create({
      orgId: organization._id,
      userId: req.user?.userId || null,
      action: "ORGANIZATION_PROFILE_UPDATED",
      entityType: "ORGANIZATION",
      entityId: organization._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: "Organization profile updated successfully",
      data: organization
    });
  } catch (error) {
    console.error("Update organization profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update organization profile"
    });
  }
};

module.exports = {
  getOrganizationProfile,
  updateOrganizationProfile,
  getAllOrganizations,
  approveOrganization,
  blockOrganization,
  deactivateSubscription,
  deleteOrganization,
  getOrganizationDetails,
};

