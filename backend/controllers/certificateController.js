const { Certificate, CertificateTemplate, AuditLog, Organization, PlanPermission } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Issue a new certificate
 * FREE plan: Single certificate only, uses default templates, certificateType required
 * PAID plans: Can use custom templates
 */
const issueCertificate = async (req, res) => {
  try {
    // 🔐 SECURITY: orgId comes ONLY from JWT token, never from request body
    // Convert string ObjectIds from JWT to Mongoose ObjectIds
    const orgId = mongoose.Types.ObjectId.isValid(req.user.orgId)
      ? new mongoose.Types.ObjectId(req.user.orgId)
      : req.user.orgId;
    const userId = mongoose.Types.ObjectId.isValid(req.user.userId)
      ? new mongoose.Types.ObjectId(req.user.userId)
      : req.user.userId;

    if (!orgId || !userId) {
      return res.status(401).json({ message: "Unauthorized: Missing organization or user context" });
    }

    const {
      recipientName,
      recipientEmail,
      courseName,
      batchName,
      issueDate,
      expiryDate,
      templateId,
      certificateType, // Required for FREE plan
    } = req.body;

    // Validate required fields
    if (!recipientName || !recipientEmail || !courseName) {
      return res.status(400).json({
        success: false,
        message: "recipientName, recipientEmail, and courseName are required"
      });
    }

    // Check subscription plan and permissions
    const organization = await Organization.findById(orgId).populate("planId");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Determine plan type and permissions from Plan model
    const planName = organization.planId?.planName || "";
    const subPlan = organization.subscriptionPlan || "";
    const isPro = ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(planName) ||
      ["PRO", "ENTERPRISE"].includes(subPlan);

    const isFreePlan = !isPro;

    // Set features based on plan (Fallback if DB permissions are missing)
    const planFeatures = {
      customTemplates: isPro,
      bulkIssuance: isPro,
      maxCertificatesPerMonth: isPro ? 100000 : 10,
      ...organization.planId?.permissions?.features
    };

    // 1. Check Monthly Issuance Limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const certificateCount = await Certificate.countDocuments({
      orgId: orgId,
      createdAt: { $gte: startOfMonth }
    });

    if (planFeatures.maxCertificatesPerMonth && certificateCount >= planFeatures.maxCertificatesPerMonth) {
      return res.status(403).json({
        success: false,
        message: `Monthly issuance limit reached (${planFeatures.maxCertificatesPerMonth}). Please upgrade your plan.`
      });
    }

    // 2. Custom Templates Check - Removed because templates owned by the org are allowed to be used.
    // Restriction is enforced during Create/Edit in templateController.
    /*
    if (templateId && !planFeatures.customTemplates) {
      return res.status(403).json({
        success: false,
        message: "Custom templates are not available for your current plan. Please upgrade to use custom templates."
      });
    }
    */

    // 3. Batch Name / Bulk Check (for single issuance)
    if (batchName && !planFeatures.bulkIssuance) {
      return res.status(403).json({
        success: false,
        message: "Batch categorization is not available for your current plan. Please upgrade."
      });
    }

    // If FREE plan, certificateType is required for fallback template
    if (isFreePlan && !certificateType) {
      return res.status(400).json({
        success: false,
        message: "certificateType is required for FREE plan."
      });
    }

    // If templateId provided, validate ObjectId format and verify it belongs to organization
    if (templateId && planFeatures.customTemplates) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid certificate template selected"
        });
      }

      const template = await CertificateTemplate.findOne({
        _id: templateId,
        orgId: orgId, // 🔐 Ensure template belongs to this org
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Certificate template not found or access denied"
        });
      }
    }

    // Create certificate - orgId comes from JWT, never from body
    const certificateData = {
      orgId: orgId, // 🔐 From JWT only
      issuedBy: userId, // 🔐 From JWT only
      recipientName,
      recipientEmail,
      courseName,
      batchName: isFreePlan ? undefined : (batchName || undefined), // FREE plan cannot use batchName
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: "ACTIVE",
      certificateId: uuidv4(), // Generate UUID for certificate ID
      certificateType: certificateType || "Completion", // Required for FREE, default for paid
    };

    // --- TEMPLATE MERGING LOGIC ---
    let finalCanvasJSON = null;

    if (templateId && mongoose.Types.ObjectId.isValid(templateId) && !isFreePlan) {
      // PAID PLAN: Use selected template
      const template = await CertificateTemplate.findOne({
        _id: templateId,
        orgId: orgId,
      });
      if (template && template.canvasJSON) {
        let canvasData;
        try {
          const decryptedString = template.getDecryptedCanvasJSON ? template.getDecryptedCanvasJSON() : template.canvasJSON;
          canvasData = typeof decryptedString === 'string' ? JSON.parse(decryptedString) : decryptedString;
        } catch (e) {
          console.error("Canvas JSON parse error:", e);
          canvasData = { elements: [] };
        }
        finalCanvasJSON = canvasData;
        certificateData.templateId = templateId;
      }
    }

    // FALLBACK / FREE PLAN: Use default template
    if (!finalCanvasJSON) {
      finalCanvasJSON = {
        elements: [
          // Border
          { id: 'border', type: 'shape', shapeType: 'rectangle', x: 50, y: 50, width: 95, height: 95, color: '#b8860b', fillColor: 'transparent', strokeWidth: 5 },
          // Title
          { id: 'title', type: 'text', content: `CERTIFICATE OF ${certificateType?.toUpperCase() || 'COMPLETION'}`, x: 50, y: 25, fontSize: 32, fontWeight: 'bold', fontFamily: 'serif', color: '#1a1a1a', align: 'center' },
          // Text
          { id: 'text1', type: 'text', content: 'This is to certify that', x: 50, y: 38, fontSize: 18, align: 'center' },
          // Recipient
          { id: 'recipient', type: 'text', content: '{{recipient_name}}', x: 50, y: 50, fontSize: 42, fontWeight: 'bold', fontFamily: 'serif', color: '#b8860b', align: 'center' },
          // Text
          { id: 'text2', type: 'text', content: 'has successfully completed', x: 50, y: 62, fontSize: 18, align: 'center' },
          // Course
          { id: 'course', type: 'text', content: '{{course_name}}', x: 50, y: 72, fontSize: 24, fontWeight: 'bold', align: 'center' },
          // Organization
          { id: 'org', type: 'text', content: '{{organization_name}}', x: 50, y: 80, fontSize: 16, align: 'center' },
          // Date
          { id: 'date', type: 'text', content: 'Issued on {{issue_date}}', x: 50, y: 85, fontSize: 14, align: 'center' },
        ],
        backgroundColor: '#ffffff',
        orientation: 'landscape'
      };

      // Add watermark for FREE plan
      if (isFreePlan) {
        finalCanvasJSON.elements.push({
          id: 'watermark',
          type: 'text',
          content: 'Issued via Certisure (Free Plan)',
          x: 50,
          y: 95,
          fontSize: 10,
          color: '#999999',
          align: 'center',
          opacity: 0.6
        });
      }
    }

    // --- MERGE ORG LOGO & SIGNATURE ---
    // If org has logo, add/replace logo element
    if (organization.logo) {
      const existingLogo = finalCanvasJSON.elements.find(el => el.type === 'logo');
      if (existingLogo) {
        existingLogo.imageUrl = organization.logo;
      } else {
        finalCanvasJSON.elements.push({
          id: 'org-logo',
          type: 'logo',
          x: 15,
          y: 15,
          width: 80,
          height: 80,
          imageUrl: organization.logo
        });
      }
    }

    // Inject actual values into placeholders (Optional, but good for final static renderData)
    const formattedDate = new Date(certificateData.issueDate).toLocaleDateString();
    finalCanvasJSON.elements = finalCanvasJSON.elements.map(el => {
      if (el.type === 'text' && el.content) {
        el.content = el.content
          .replace(/{{recipient_name}}/g, recipientName)
          .replace(/{{course_name}}/g, courseName)
          .replace(/{{issue_date}}/g, formattedDate)
          .replace(/{{organization_name}}/g, organization.name || 'Our Academy')
          .replace(/{{certificate_id}}/g, certificateData.certificateId)
          .replace(/{{certificate_type}}/g, certificateType || 'Completion');
      }
      return el;
    });

    certificateData.renderData = finalCanvasJSON;

    const certificate = await Certificate.create(certificateData);

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: userId,
      action: "CERTIFICATE_ISSUED",
      entityType: "CERTIFICATE",
      entityId: certificate._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: {
        recipientEmail,
        courseName,
        certificateId: certificate.certificateId,
      },
    });

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Certificate Issue Error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message).join(", ");
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`
      });
    }

    // Handle Mongoose cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path || 'data'} format`
      });
    }

    // Handle duplicate key errors (e.g., duplicate certificateId - should not happen with UUID)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Certificate with this ID already exists"
      });
    }

    // In development, return the actual error message for debugging
    const errorMessage = process.env.NODE_ENV === "production"
      ? "Certificate creation failed"
      : error.message || "Certificate creation failed";

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

/**
 * Get all certificates for the organization
 * 🔐 STRICT ORG ISOLATION - Only returns certificates for user's organization
 */
/**
 * Get all certificates for the organization
 * 🔐 STRICT ORG ISOLATION - Only returns certificates for user's organization
 */
const getCertificates = async (req, res) => {
  try {
    // 🔐 SECURITY: orgId comes ONLY from JWT token
    const rawOrgId = req.user.orgId;

    if (!rawOrgId) {
      console.error("Access denied: No orgId in token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing organization context"
      });
    }

    // Convert to ObjectId explicitly to prevent type mismatches
    const orgId = new mongoose.Types.ObjectId(rawOrgId);

    // 🔐 CRITICAL: Always filter by orgId - never fetch all certificates
    const certificates = await Certificate.find({
      orgId: { $eq: orgId }, // 🔐 ORGANIZATION ISOLATION - No exceptions
    })
      .populate("templateId", "templateName")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch certificates"
    });
  }
};

/**
 * Bulk issue certificates
 * PAID PLANS ONLY - FREE users cannot issue bulk certificates
 */
const bulkIssueCertificates = async (req, res) => {
  try {
    const orgId = mongoose.Types.ObjectId.isValid(req.user.orgId)
      ? new mongoose.Types.ObjectId(req.user.orgId)
      : req.user.orgId;
    const userId = mongoose.Types.ObjectId.isValid(req.user.userId)
      ? new mongoose.Types.ObjectId(req.user.userId)
      : req.user.userId;

    if (!orgId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing organization or user context"
      });
    }

    // Check subscription plan and permissions
    const organization = await Organization.findById(orgId).populate("planId");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    const planName = organization.planId?.planName || "";
    const subPlan = organization.subscriptionPlan || "";
    const isPro = ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(planName) ||
      ["PRO", "ENTERPRISE"].includes(subPlan);

    const planFeatures = {
      bulkIssuance: isPro,
      ...organization.planId?.permissions?.features
    };

    if (!planFeatures.bulkIssuance) {
      return res.status(403).json({
        success: false,
        message: `Bulk issuance is not available on your current plan (${organization.subscriptionPlan}). Please upgrade.`
      });
    }

    const { certificates } = req.body; // Array of certificate data

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "certificates array is required and must not be empty"
      });
    }

    // Validate all certificates
    const validatedCertificates = [];
    for (const cert of certificates) {
      if (!cert.recipientName || !cert.recipientEmail || !cert.courseName) {
        return res.status(400).json({
          success: false,
          message: "Each certificate must have recipientName, recipientEmail, and courseName"
        });
      }

      validatedCertificates.push({
        orgId: orgId,
        issuedBy: userId,
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        courseName: cert.courseName,
        batchName: cert.batchName || undefined,
        issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        status: "ACTIVE",
        certificateId: uuidv4(),
        certificateType: cert.certificateType || "Completion",
        templateId: cert.templateId && mongoose.Types.ObjectId.isValid(cert.templateId)
          ? cert.templateId
          : undefined,
      });
    }

    // Insert all certificates
    const createdCertificates = await Certificate.insertMany(validatedCertificates);

    // Log audit event
    await AuditLog.create({
      orgId: orgId,
      userId: userId,
      action: "BULK_CERTIFICATES_ISSUED",
      entityType: "CERTIFICATE",
      entityId: null,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: {
        count: createdCertificates.length,
        batchName: validatedCertificates[0]?.batchName,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        count: createdCertificates.length,
        certificates: createdCertificates,
      },
    });
  } catch (error) {
    console.error("Bulk certificate issue error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to issue bulk certificates"
    });
  }
};

/**
 * Get ALL certificates (Master Dashboard)
 */
const getAllCertificates = async (req, res) => {
  try {
    // TODO: Add SUPER_ADMIN check
    const certificates = await Certificate.find({})
      .populate("orgId", "name subscriptionPlan")
      .populate("templateId", "templateName")
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get all certificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch certificates"
    });
  }
};

/**
 * Delete a certificate (Master Dashboard)
 */
const deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find certificate first to get orgId for audit
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    await Certificate.findByIdAndDelete(certificateId);

    // Log audit
    await AuditLog.create({
      orgId: certificate.orgId,
      userId: req.user?.userId || null,
      action: "CERTIFICATE_DELETED_BY_MASTER",
      entityType: "CERTIFICATE",
      entityId: certificateId,
      details: { certificateId: certificate.certificateId },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Delete certificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete certificate"
    });
  }
};

/**
 * Verify a certificate (Public)
 * Used by the verification portal
 */
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    const certificate = await Certificate.findOne({ certificateId })
      .populate("orgId", "name logo website subscriptionPlan")
      .select("-issuedBy"); // Don't expose issuer user ID

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Certificate verification failed",
    });
  }
};

module.exports = {
  issueCertificate,
  getCertificates,
  bulkIssueCertificates,
  getAllCertificates,
  deleteCertificate,
  verifyCertificate,
};
