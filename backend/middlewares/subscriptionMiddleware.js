const { Organization, Plan } = require("../models");

/**
 * Middleware to check specific feature permission from Plan collection
 * Blocks access if feature is disabled in the plan
 */
const checkPlanPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const orgId = req.user.orgId;

      if (!orgId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Missing organization context"
        });
      }

      // Fetch organization with populated planId to get latest permissions
      const organization = await Organization.findById(orgId).populate("planId");

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Organization not found"
        });
      }

      // If planId is missing, fallback to FREE plan check or generic permissions
      let plan = organization.planId;
      if (!plan) {
        plan = await Plan.findOne({ planName: organization.subscriptionPlan || "FREE" });
      }

      if (!plan) {
        return res.status(500).json({
          success: false,
          message: "Plan configuration not found"
        });
      }

      // Check permission
      const hasPermission = plan.permissions && plan.permissions[permissionKey];

      if (!hasPermission) {
        const featureNames = {
          bulkIssuance: "Bulk Issuance",
          analytics: "Advanced Analytics",
          customTemplates: "Custom Templates",
          emailTemplates: "Email Templates",
          teams: "Team Management",
          apiAccess: "API Access"
        };
        const featureLabel = featureNames[permissionKey] || permissionKey;

        return res.status(403).json({
          success: false,
          message: `This feature (${featureLabel}) is disabled for your current plan (${plan.planName}). Please contact your plan administrator.`
        });
      }

      // Pass plan data to request
      req.plan = plan;
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify feature permissions"
      });
    }
  };
};

/**
 * Middleware to check if organization has paid subscription plan
 * Blocks FREE plan users from accessing paid features
 */
const requirePaidPlan = async (req, res, next) => {
  try {
    const orgId = req.user.orgId;

    if (!orgId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing organization context"
      });
    }

    const organization = await Organization.findById(orgId).select("subscriptionPlan");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    if (organization.subscriptionPlan === "FREE") {
      return res.status(403).json({
        success: false,
        message: "This feature is available for paid plans only. Please upgrade your plan to access this feature."
      });
    }

    // Store subscription plan in request for use in controllers
    req.user.subscriptionPlan = organization.subscriptionPlan;
    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify subscription plan"
    });
  }
};

/**
 * Helper function to check subscription plan (non-middleware)
 * Returns true if organization has paid plan
 */
const hasPaidPlan = async (orgId) => {
  try {
    const organization = await Organization.findById(orgId).select("subscriptionPlan");
    if (!organization) return false;
    return organization.subscriptionPlan !== "FREE";
  } catch (error) {
    console.error("Subscription check error:", error);
    return false;
  }
};

module.exports = {
  checkPlanPermission,
  requirePaidPlan,
  hasPaidPlan,
};

