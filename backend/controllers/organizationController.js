const { Organization } = require("../models");

/**
 * Get organization profile
 */
const getOrganizationProfile = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const organization = await Organization.findById(orgId).select("name type email subscriptionPlan subscriptionStatus");

    if (!organization) {
      return res.status(404).json({ 
        success: false,
        message: "Organization not found" 
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to fetch organization" 
    });
  }
};

module.exports = {
  getOrganizationProfile,
};

