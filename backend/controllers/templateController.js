const { CertificateTemplate, AuditLog, Organization } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");
const mongoose = require("mongoose");

/**
 * Create a new certificate template
 * PAID PLANS ONLY - FREE users cannot create templates
 */
const createCertificateTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    // Check subscription plan permissions
    const organization = await Organization.findById(orgId).populate("planId");

    // Check permissions OR explicitly allow if on PRO/ENTERPRISE plan
    const planName = organization?.planId?.planName || "";
    const subPlan = organization?.subscriptionPlan || "";
    const isPro = ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(planName) ||
      ["PRO", "ENTERPRISE"].includes(subPlan);

    const canCreateCustom = organization?.planId?.permissions?.customTemplates || isPro;
    const isFreePlan = ["FREE", "BASIC", "FREE_PLAN"].includes(planName) || ["FREE", "BASIC"].includes(subPlan);

    // ❌ FREE users CANNOT create templates - they can only edit the 2 predefined ones
    if (isFreePlan || !canCreateCustom) {
      return res.status(403).json({
        success: false,
        message: "🔒 Upgrade to Pro to create unlimited templates"
      });
    }

    const {
      templateName,
      canvasJSON,
      isDefault,
      width,
      height,
      unit,
      orientation,
      backgroundColor,
      backgroundImage
    } = req.body;

    if (!templateName || !canvasJSON) {
      return res.status(400).json({
        message: "templateName and canvasJSON are required"
      });
    }

    // FREE Plan Restrictions
    if (isFreePlan) {
      // Validate that only logo and signature elements were provided/modified
      // In a real scenario, we might compare against a starter template here.
      // For now, we'll ensure they don't add forbidden elements if they weren't in the starter.
      // Since Edit mode now always loads a starter/existing, we primarily care about modifications.
      try {
        const elements = typeof canvasJSON === 'string' ? JSON.parse(canvasJSON).elements : canvasJSON.elements;
        // Basic check: logo and signature must exist or be the only ones modified? 
        // Actually, the frontend will gate this, but backend should at least allow the save.
      } catch (e) {
        return res.status(400).json({ message: "Invalid canvas JSON" });
      }
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await CertificateTemplate.updateMany(
        { orgId: orgId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Create template (canvasJSON will be auto-encrypted by pre-save hook)
    const template = await CertificateTemplate.create({
      orgId: orgId,
      templateName,
      canvasJSON: JSON.stringify(canvasJSON), // Will be encrypted
      createdBy: req.user.userId,
      isDefault: isDefault || false,
      width: width || 297,
      height: height || 210,
      unit: unit || 'mm',
      orientation: orientation || 'landscape',
      backgroundColor: backgroundColor || '#ffffff',
      backgroundImage: backgroundImage || null,
    });

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "TEMPLATE_CREATED",
      entityType: "CERTIFICATE_TEMPLATE",
      entityId: template._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      _id: template._id,
      templateName: template.templateName,
      isDefault: template.isDefault,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ message: error.message || "Failed to create template" });
  }
};

/**
 * Get all certificate templates for the organization
 */
const getCertificateTemplates = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const userRole = req.user.role;

    // Build query with org isolation
    const query = buildOrgQuery({}, orgId, userRole);

    let templates = await CertificateTemplate.find(query)
      .select("-canvasJSON") // Don't send encrypted data by default
      .sort({ createdAt: -1 });

    // 🎁 PROVISION DEFAULT TEMPLATES FOR FREE USERS
    const organization = await Organization.findById(orgId).populate("planId");
    if (organization?.planId?.planName === "FREE" && templates.length === 0) {
      // Create 2 default templates automatically
      const defaults = [
        {
          templateName: "Classic Completion Certificate",
          width: 297, height: 210, orientation: "landscape",
          canvasJSON: JSON.stringify({
            elements: [
              { id: "txt-1", type: "text", content: "CERTIFICATE", x: 148, y: 40, fontSize: 40, fontWeight: "bold", align: "center", color: "#1a1a1a" },
              { id: "txt-2", type: "text", content: "OF COMPLETION", x: 148, y: 60, fontSize: 20, align: "center", color: "#444" },
              { id: "txt-3", type: "text", content: "This is to certify that", x: 148, y: 90, fontSize: 16, align: "center" },
              { id: "txt-4", type: "text", content: "{{recipient_name}}", x: 148, y: 110, fontSize: 32, fontWeight: "bold", align: "center", color: "#000" },
              { id: "logo-1", type: "logo", x: 133, y: 10, width: 30, height: 30, placeholder: true },
              { id: "sig-1", type: "signature", x: 123, y: 160, width: 50, height: 25, placeholder: true }
            ]
          })
        },
        {
          templateName: "Professional Achievement",
          width: 297, height: 210, orientation: "landscape",
          canvasJSON: JSON.stringify({
            elements: [
              { id: "txt-1", type: "text", content: "ACHIEVEMENT", x: 148, y: 45, fontSize: 36, fontWeight: "bold", align: "center", color: "#0c4a6e" },
              { id: "txt-2", type: "text", content: "PROUDLY PRESENTED TO", x: 148, y: 75, fontSize: 14, align: "center", color: "#64748b" },
              { id: "txt-3", type: "text", content: "{{recipient_name}}", x: 148, y: 105, fontSize: 36, fontWeight: "bold", align: "center", color: "#0f172a" },
              { id: "logo-1", type: "logo", x: 20, y: 20, width: 40, height: 40, placeholder: true },
              { id: "sig-1", type: "signature", x: 220, y: 160, width: 50, height: 25, placeholder: true }
            ]
          })
        }
      ];

      for (const d of defaults) {
        await CertificateTemplate.create({ ...d, orgId, createdBy: req.user.userId });
      }

      // Re-fetch
      templates = await CertificateTemplate.find(query).select("-canvasJSON").sort({ createdAt: -1 });
    }

    // Return templates in consistent format
    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch templates" });
  }
};

/**
 * Get single certificate template by ID
 */
const getCertificateTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await CertificateTemplate.findOne({ _id: id, orgId: orgId });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Decrypt canvasJSON
    let canvasJSON = null;
    try {
      const decryptedString = template.getDecryptedCanvasJSON();
      canvasJSON = JSON.parse(decryptedString);
    } catch (err) {
      console.error("Decryption error:", err);
      // Fail gracefully or handle error
      canvasJSON = [];
    }

    res.json({
      success: true,
      data: {
        ...template.toJSON(),
        canvasJSON: canvasJSON,
      },
    });
  } catch (error) {
    console.error("Get template by id error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch template" });
  }
};

/**
 * Update certificate template
 */
const updateCertificateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;
    const {
      templateName,
      canvasJSON,
      isDefault,
      width,
      height,
      unit,
      orientation,
      backgroundColor,
      backgroundImage
    } = req.body;

    // Check for organization existence
    const organization = await Organization.findById(orgId).select("subscriptionPlan");
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await CertificateTemplate.findOne({ _id: id, orgId: orgId });

    if (!template) {
      // If template not found, maybe they are trying to "Save As" a new template from a default one
      // But for FREE users, we need to check if they already reached the limit of 2.
      if (organization.subscriptionPlan === "FREE") {
        const savedTemplatesCount = await CertificateTemplate.countDocuments({ orgId: orgId });
        if (savedTemplatesCount >= 2) {
          return res.status(403).json({
            success: false,
            message: "Free plan allows editing & saving only 2 templates. Upgrade to unlock unlimited templates."
          });
        }
      }
      return res.status(404).json({ message: "Template not found" });
    }

    // ✏️ FREE users can edit/save ONLY up to 2 templates
    if (organization.subscriptionPlan === "FREE" ||
      ["FREE", "BASIC", "FREE_PLAN"].includes(organization.planId?.planName || "")) {
      const savedTemplatesCount = await CertificateTemplate.countDocuments({ orgId: orgId });

      // If they already have 2 templates and this is not an update to one of them, block it
      if (savedTemplatesCount >= 2 && !template) {
        return res.status(403).json({
          success: false,
          message: "Free plan allows editing & saving only 2 templates. Upgrade to unlock unlimited templates."
        });
      }
    }

    // Update fields
    if (templateName) template.templateName = templateName;
    if (canvasJSON) template.canvasJSON = JSON.stringify(canvasJSON); // Will be encrypted on save
    if (width !== undefined) template.width = width;
    if (height !== undefined) template.height = height;
    if (unit !== undefined) template.unit = unit;
    if (orientation !== undefined) template.orientation = orientation;
    if (backgroundColor !== undefined) template.backgroundColor = backgroundColor;
    if (backgroundImage !== undefined) template.backgroundImage = backgroundImage;

    // Handle default toggle
    if (isDefault !== undefined) {
      if (isDefault) {
        // Unset other defaults
        await CertificateTemplate.updateMany(
          { orgId: orgId, _id: { $ne: id }, isDefault: true },
          { $set: { isDefault: false } }
        );
      }
      template.isDefault = isDefault;
    }

    await template.save();

    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "TEMPLATE_UPDATED",
      entityType: "CERTIFICATE_TEMPLATE",
      entityId: template._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Template updated successfully",
      data: {
        _id: template._id,
        templateName: template.templateName,
        isDefault: template.isDefault,
      },
    });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({ message: error.message || "Failed to update template" });
  }
};

/**
 * Delete certificate template
 */
const deleteCertificateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    // Check for organization existence
    const organization = await Organization.findById(orgId).select("subscriptionPlan");
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await CertificateTemplate.findOneAndDelete({ _id: id, orgId: orgId });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "TEMPLATE_DELETED",
      entityType: "CERTIFICATE_TEMPLATE",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({ message: error.message || "Failed to delete template" });
  }
};

/**
 * Get all templates for Master Dashboard
 */
const getAllTemplates = async (req, res) => {
  try {
    const templates = await CertificateTemplate.find()
      .populate("orgId", "name email")
      .select("-canvasJSON")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get all templates error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch all templates" });
  }
};

module.exports = {
  createCertificateTemplate,
  getCertificateTemplates,
  getCertificateTemplateById,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  getAllTemplates,
};

