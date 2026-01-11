const { EmailTemplate, AuditLog, Organization } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");

/**
 * Create a new email template
 * PAID PLANS ONLY - FREE users cannot create email templates
 */
const createEmailTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { name, subject, htmlBody, isDefault, certificateType } = req.body;

    // Check subscription plan
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
        message: "This feature is available for paid plans only. Please upgrade your plan to create email templates."
      });
    }

    if (!name || !subject || !htmlBody) {
      return res.status(400).json({
        success: false,
        message: "name, subject, and htmlBody are required"
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await EmailTemplate.updateMany(
        { orgId: orgId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Create template (htmlBody will be auto-encrypted by pre-save hook)
    const template = await EmailTemplate.create({
      orgId: orgId,
      name,
      subject,
      htmlBody, // Will be encrypted
      isDefault: isDefault || false,
      certificateType: certificateType || "All",
    });

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "EMAIL_TEMPLATE_CREATED",
      entityType: "EMAIL_TEMPLATE",
      entityId: template._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      data: {
        _id: template._id,
        name: template.name,
        subject: template.subject,
        isDefault: template.isDefault,
        certificateType: template.certificateType,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create email template error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create email template"
    });
  }
};

/**
 * Get all email templates for the organization
 * PAID PLANS ONLY - FREE users cannot access email templates
 */
const getEmailTemplates = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const userRole = req.user.role;

    // Check subscription plan
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
        message: "This feature is available for paid plans only. Please upgrade your plan to access email templates."
      });
    }

    // Build query with org isolation
    const query = buildOrgQuery({}, orgId, userRole);

    const templates = await EmailTemplate.find(query)
      .select("-htmlBody") // Don't send encrypted data by default
      .sort({ createdAt: -1 });

    // Decrypt htmlBody for each template if needed
    const templatesWithDecryptedBody = await Promise.all(
      templates.map(async (template) => {
        const decryptedBody = template.getDecryptedHtmlBody();
        return {
          _id: template._id,
          name: template.name,
          subject: template.subject,
          htmlBody: decryptedBody,
          isDefault: template.isDefault,
          certificateType: template.certificateType,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        };
      })
    );

    res.json({
      success: true,
      data: templatesWithDecryptedBody,
    });
  } catch (error) {
    console.error("Get email templates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch email templates"
    });
  }
};

/**
 * Get single email template by ID
 */
const getEmailTemplateById = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { id } = req.params;

    // Check subscription plan
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
        message: "This feature is available for paid plans only."
      });
    }

    const template = await EmailTemplate.findOne({
      _id: id,
      orgId: orgId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found or access denied"
      });
    }

    // Decrypt htmlBody
    let decryptedBody = null;
    try {
      decryptedBody = template.getDecryptedHtmlBody();
    } catch (err) {
      console.error("Decryption error:", err);
      decryptedBody = "";
    }

    res.json({
      success: true,
      data: {
        _id: template._id,
        name: template.name,
        subject: template.subject,
        htmlBody: decryptedBody,
        isDefault: template.isDefault,
        certificateType: template.certificateType,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get email template by id error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch email template"
    });
  }
};

/**
 * Update an email template
 * PAID PLANS ONLY
 */
const updateEmailTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const templateId = req.params.id;
    const { name, subject, htmlBody, isDefault, certificateType } = req.body;

    // Check subscription plan
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
        message: "This feature is available for paid plans only."
      });
    }

    const template = await EmailTemplate.findOne({
      _id: templateId,
      orgId: orgId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found or access denied"
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await EmailTemplate.updateMany(
        { orgId: orgId, isDefault: true, _id: { $ne: templateId } },
        { $set: { isDefault: false } }
      );
    }

    // Update template
    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (htmlBody) template.htmlBody = htmlBody; // Will be encrypted
    if (isDefault !== undefined) template.isDefault = isDefault;
    if (certificateType) template.certificateType = certificateType;

    await template.save();

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "EMAIL_TEMPLATE_UPDATED",
      entityType: "EMAIL_TEMPLATE",
      entityId: template._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: {
        _id: template._id,
        name: template.name,
        subject: template.subject,
        isDefault: template.isDefault,
        certificateType: template.certificateType,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update email template error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update email template"
    });
  }
};

/**
 * Delete an email template
 * PAID PLANS ONLY
 */
const deleteEmailTemplate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const templateId = req.params.id;

    // Check subscription plan
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
        message: "This feature is available for paid plans only."
      });
    }

    const template = await EmailTemplate.findOneAndDelete({
      _id: templateId,
      orgId: orgId,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found or access denied"
      });
    }

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: req.user.userId,
      action: "EMAIL_TEMPLATE_DELETED",
      entityType: "EMAIL_TEMPLATE",
      entityId: templateId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Email template deleted successfully",
    });
  } catch (error) {
    console.error("Delete email template error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete email template"
    });
  }
};

module.exports = {
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};

