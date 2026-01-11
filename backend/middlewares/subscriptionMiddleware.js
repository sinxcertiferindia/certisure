const { Organization } = require("../models");

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
  requirePaidPlan,
  hasPaidPlan,
};

