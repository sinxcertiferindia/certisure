const { CertificateTemplate, AuditLog } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");

/**
 * Create a new certificate template
 */
const createCertificateTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { templateName, canvasJSON, isDefault } = req.body;

    if (!templateName || !canvasJSON) {
      return res.status(400).json({ 
        message: "templateName and canvasJSON are required" 
      });
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

    const templates = await CertificateTemplate.find(query)
      .select("-canvasJSON") // Don't send encrypted data by default
      .sort({ createdAt: -1 });

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

module.exports = {
  createCertificateTemplate,
  getCertificateTemplates,
};

