const { Organization, AuditLog, Plan } = require("../models");

/**
 * Get organization profile (Dynamic Plan Data)
 */
const getOrganizationProfile = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const organization = await Organization.findById(orgId)
      .select("name type email subscriptionPlan subscriptionStatus logo planId certificatePrefixes defaultCertificatePrefix monthlyCertificateLimit certificatesIssuedThisMonth subscriptionEndDate")
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
      .select("name email subscriptionPlan paymentStatus accountStatus subscriptionStartDate subscriptionEndDate createdAt planId monthlyCertificateLimit certificatesIssuedThisMonth")
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

    // Calculate subscription end date (1 month from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    // Sync Limit from Plan
    const Plan = require("../models/Plan");
    // Find plan by ID if exists, otherwise by enum string
    let plan = null;
    if (organization.planId) {
      plan = await Plan.findById(organization.planId);
    }
    if (!plan && organization.subscriptionPlan) {
      plan = await Plan.findOne({ planName: organization.subscriptionPlan });
    }

    if (plan) {
      organization.monthlyCertificateLimit = plan.maxCertificatesPerMonth;
      if (!organization.planId) organization.planId = plan._id;
    } else {
      // Fallback defaults if Plan not found in DB
      const defaults = { 'FREE': 50, 'PRO': 500, 'ENTERPRISE': 1500 };
      organization.monthlyCertificateLimit = defaults[organization.subscriptionPlan] || 50;
    }

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
    const { name, type, logo, website, certificatePrefixes, defaultCertificatePrefix } = req.body;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Update fields if provided
    if (name) organization.name = name;
    if (type !== undefined) organization.type = type;
    if (website !== undefined) organization.website = website;
    if (logo) organization.logo = logo;

    // Handle certificatePrefixes update
    if (certificatePrefixes && Array.isArray(certificatePrefixes)) {
      const validatedPrefixes = certificatePrefixes
        .map(p => typeof p === 'string' ? p.toUpperCase().trim() : '')
        .filter(p => /^[A-Z0-9]+$/.test(p) && p.length >= 2 && p.length <= 10);

      organization.certificatePrefixes = validatedPrefixes;
    }

    // Ensure certificatePrefixes is an array before using .includes()
    if (!Array.isArray(organization.certificatePrefixes)) {
      organization.certificatePrefixes = [];
    }

    // Handle defaultCertificatePrefix update
    if (defaultCertificatePrefix) {
      const defPrefix = defaultCertificatePrefix.toUpperCase().trim();
      if (/^[A-Z0-9]+$/.test(defPrefix)) {
        organization.defaultCertificatePrefix = defPrefix;

        // Ensure it is in the list of prefixes
        if (!organization.certificatePrefixes.includes(defPrefix)) {
          organization.certificatePrefixes.push(defPrefix);
        }
      }
    }

    // Deprecated single prefix field support
    if (req.body.certificatePrefix && !certificatePrefixes) {
      const prefix = req.body.certificatePrefix.toUpperCase().trim();
      if (/^[A-Z0-9]+$/.test(prefix) && prefix.length >= 2 && prefix.length <= 10) {
        if (!organization.certificatePrefixes.includes(prefix)) {
          organization.certificatePrefixes.push(prefix);
        }
        organization.defaultCertificatePrefix = prefix;
      }
    }

    await organization.save();

    // Log audit event
    try {
      await AuditLog.create({
        orgId: organization._id,
        userId: req.user?.userId || null,
        action: "ORGANIZATION_PROFILE_UPDATED",
        entityType: "ORGANIZATION",
        entityId: organization._id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        metadata: { updatedFields: Object.keys(req.body).filter(k => k !== 'logo') } // Don't log logo data
      });
    } catch (auditError) {
      console.error("Audit log creation failed during profile update:", auditError);
      // Don't fail the request if audit log fails
    }

    res.json({
      success: true,
      message: "Organization profile updated successfully",
      data: organization
    });
  } catch (error) {
    console.error("Update organization profile error:", error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update organization profile",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Restart/Upgrade organization subscription (Master Dashboard)
 * Resets start date to today and end date to 1 month from today
 */
const restartSubscription = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { planName } = req.body; // Optional: Upgrade details if needed

    // TODO: Add SUPER_ADMIN check middleware

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Reset dates: Start = NOW, End = NOW + 1 Month
    // Reset dates: Start = NOW, End = NOW + 1 Month
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    organization.subscriptionStatus = "ACTIVE";
    organization.accountStatus = "ACTIVE";
    organization.subscriptionStartDate = newStartDate;
    organization.subscriptionEndDate = newEndDate;
    organization.certificatesIssuedThisMonth = 0;

    // Sync Limit from Plan (Handling both restart and upgrade)
    const Plan = require("../models/Plan");
    let planNameTarget = planName || organization.subscriptionPlan;

    // Fallback defaults
    const defaults = { 'FREE': 50, 'PRO': 500, 'ENTERPRISE': 1500 };

    if (planNameTarget) {
      const newPlan = await Plan.findOne({ planName: planNameTarget });
      if (newPlan) {
        organization.subscriptionPlan = planNameTarget;
        organization.planId = newPlan._id;
        organization.monthlyCertificateLimit = newPlan.maxCertificatesPerMonth;
      } else {
        // Fallback if DB plan missing
        organization.monthlyCertificateLimit = defaults[planNameTarget] || 50;
        if (planName) organization.subscriptionPlan = planName; // Ensure upgrade name sticks
      }
    }

    await organization.save();

    // Log audit
    await AuditLog.create({
      orgId: organization._id,
      userId: req.user?.userId || null,
      action: "SUBSCRIPTION_RESTARTED",
      entityType: "ORGANIZATION",
      entityId: organization._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { newPlan: planName || "Same Plan" }
    });

    res.json({
      success: true,
      message: "Subscription restarted successfully",
      data: organization
    });

  } catch (error) {
    console.error("Restart subscription error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to restart subscription"
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
  restartSubscription,
};

