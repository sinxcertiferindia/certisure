const { Certificate, CertificateTemplate, AuditLog, Organization, PlanPermission } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");
const mongoose = require("mongoose");
const QRCode = require('qrcode');

/**
 * Generate QR code data URL
 */
const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR Generation Error:', err);
    return null;
  }
};

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

    // Check for certificatePrefixes
    const prefixes = organization.certificatePrefixes || [];
    const defaultPrefix = organization.defaultCertificatePrefix || (prefixes.length > 0 ? prefixes[0] : null);

    // If no prefix set at all, return 403
    if (!defaultPrefix && !req.body.certificatePrefix) {
      return res.status(403).json({
        success: false,
        message: "Please set certificate ID prefix in organization settings."
      });
    }

    // Determine prefix to use: requested prefix (if valid for org) or default
    let prefixToUse = req.body.certificatePrefix?.toUpperCase() || defaultPrefix;

    // Security: If a prefix is requested, ensure it belongs to the organization (or just allow if admin?)
    // Actually, for flexibility, we can just use the provided one OR ensure it's in the list.
    // Let's allow any if provided by the user (UI should show options).

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

    // 1. Subscription Expiry Check
    if (organization.subscriptionEndDate && new Date() > new Date(organization.subscriptionEndDate)) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue issuing certificates."
      });
    }

    // 2. Monthly Limit & Reset Logic
    const now = new Date();
    const lastReset = organization.lastResetDate ? new Date(organization.lastResetDate) : new Date(0);

    // Check if month changed
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // RESET
      organization.certificatesIssuedThisMonth = 0;
      organization.lastResetDate = now;
      await organization.save();
    }

    // Check Limit
    const monthlyLimit = organization.monthlyCertificateLimit || (isPro ? 500 : 50); // Fallback defaults

    // Use strict check from Organization model
    if (organization.certificatesIssuedThisMonth >= monthlyLimit) {
      return res.status(403).json({
        success: false,
        message: `Your monthly certificate limit (${monthlyLimit}) has been reached. Upgrade your plan to increase limits.`
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
    let template = null;
    console.log("DEBUG: Received templateId:", templateId); // DEBUG LOG
    if (templateId) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid certificate template selected"
        });
      }

      template = await CertificateTemplate.findOne({
        _id: templateId,
        orgId: orgId, // 🔐 Ensure template belongs to this org
      });
      console.log("DEBUG: Template found via ID:", template ? template._id : "null"); // DEBUG LOG

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Certificate template not found or access denied"
        });
      }
    } else if (isFreePlan) {
      // 🛡️ SAFETY NET: If Free user didn't select a template (frontend issue?), try to find their default or most recent one
      // This prevents falling back to the generic "Basic" template which they likely don't want
      console.log("DEBUG: Free plan user with no templateId. Searching for fallback template...");

      // Try to find default first
      template = await CertificateTemplate.findOne({ orgId: orgId, isDefault: true });

      // If no default, get the most recently updated one
      if (!template) {
        template = await CertificateTemplate.findOne({ orgId: orgId }).sort({ updatedAt: -1 });
      }

      console.log("DEBUG: Auto-selected fallback template:", template ? template._id : "none");
    }

    // Generate Unique readable ID
    const currentYear = new Date().getFullYear();
    let finalId = "";
    let isUnique = false;

    // Safety break counter
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      // Generate 5 random alphanumeric characters
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomStr = '';
      for (let i = 0; i < 5; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      finalId = `${prefixToUse}-${currentYear}-${randomStr}`;

      // Check collision on the unified certificateId field
      const existing = await Certificate.findOne({ certificateId: finalId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique certificate ID. Please try again."
      });
    }

    // 🔗 Construct Public Verification URL
    const origin = req.get('origin') || req.get('referer');
    const frontendBase = process.env.FRONTEND_URL || (origin ? new URL(origin).origin : 'http://localhost:5173');
    const qrCodeUrl = `${frontendBase}/verify/${finalId}`; // Switching to path-based ID for cleaner URLs

    // 🔳 Generate QR Code Image (Base64)
    const qrCodeImage = await generateQR(qrCodeUrl);

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
      certificateId: finalId, // Now using the unified format
      qrCodeUrl,
      qrCodeImage,
      issuedYear: currentYear,
      certificateType: certificateType || "Completion", // Required for FREE, default for paid
    };

    // --- TEMPLATE MERGING LOGIC ---
    let finalCanvasJSON = null;

    if (template) {
      // Use selected template for ALL plans
      if (template.canvasJSON) {
        let canvasData;
        try {
          const decryptedString = template.getDecryptedCanvasJSON ? template.getDecryptedCanvasJSON() : template.canvasJSON;
          canvasData = typeof decryptedString === 'string' ? JSON.parse(decryptedString) : decryptedString;
        } catch (e) {
          console.error("Canvas JSON parse error:", e);
          canvasData = { elements: [] };
        }
        finalCanvasJSON = canvasData;
        console.log("DEBUG: extracted canvasData elements count:", finalCanvasJSON?.elements?.length); // DEBUG LOG
        certificateData.templateId = template._id;
      }
    }
    console.log("DEBUG: finalCanvasJSON set:", !!finalCanvasJSON); // DEBUG LOG

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

    // --- ADD QR CODE ELEMENT ---
    if (certificateData.qrCodeImage) {
      const existingQRCode = finalCanvasJSON.elements.find(el => el.type === 'qrcode');
      if (existingQRCode) {
        // Update existing QR placeholder from builder
        existingQRCode.imageUrl = certificateData.qrCodeImage;
        existingQRCode.placeholder = false;
      } else {
        // Fallback: Add default QR code if not present in template
        finalCanvasJSON.elements.push({
          id: 'qr-code',
          type: 'qrcode',
          x: 85, // Bottom right approx
          y: 85,
          width: 80,
          height: 80,
          imageUrl: certificateData.qrCodeImage
        });
      }
    }

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

    // 4. Increment Usage Count
    await Organization.findByIdAndUpdate(orgId, {
      $inc: { certificatesIssuedThisMonth: 1 }
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

    // Bulk ID generation logic
    const currentYear = new Date().getFullYear();
    const prefixes = organization.certificatePrefixes || [];
    const defaultPrefix = organization.defaultCertificatePrefix || (prefixes.length > 0 ? prefixes[0] : "CERT");

    // Validate all certificates
    const validatedCertificates = [];
    for (const cert of certificates) {
      if (!cert.recipientName || !cert.recipientEmail || !cert.courseName) {
        return res.status(400).json({
          success: false,
          message: "Each certificate must have recipientName, recipientEmail, and courseName"
        });
      }

      // Generate a quick random ID for each in the bulk
      // For bulk, we'll use a slightly different random parts or just rely on the loop
      // but to be safe we generate it here.
      const prefixToUse = cert.prefix || defaultPrefix;
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const finalId = `${prefixToUse}-${currentYear}-${randomStr}`;

      // 🔗 Construct Public Verification URL
      const origin = req.get('origin') || req.get('referer');
      const frontendBase = process.env.FRONTEND_URL || (origin ? new URL(origin).origin : 'http://localhost:5173');
      const qrCodeUrl = `${frontendBase}/verify/${finalId}`;
      const qrCodeImage = await generateQR(qrCodeUrl);

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
        certificateId: finalId,
        qrCodeUrl,
        qrCodeImage,
        certificateType: cert.certificateType || "Completion",
        templateId: cert.templateId && mongoose.Types.ObjectId.isValid(cert.templateId)
          ? cert.templateId
          : undefined,
        issuedYear: currentYear,
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
 * Delete a certificate (Master Dashboard or Organization Dashboard)
 */
const deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find certificate first to get orgId for audit
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Permission Check
    const userRole = req.user.role;
    const userOrgId = req.user.orgId; // Assuming string or ObjectId from token

    // If not super admin, check ownership
    if (userRole !== "SUPER_ADMIN") {
      // Ensure the certificate belongs to the user's organization
      if (!certificate.orgId || certificate.orgId.toString() !== userOrgId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You can only delete certificates issued by your organization."
        });
      }
    }

    await Certificate.findByIdAndDelete(certificateId);

    // Log audit
    await AuditLog.create({
      orgId: certificate.orgId,
      userId: req.user?.userId || null,
      action: userRole === "SUPER_ADMIN" ? "CERTIFICATE_DELETED_BY_MASTER" : "CERTIFICATE_DELETED",
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

    // Only find by unified certificateId (case-insensitive search)
    const query = {
      certificateId: { $regex: new RegExp(`^${certificateId}$`, "i") }
    };

    const certificate = await Certificate.findOne(query)
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

/**
 * Verify and authorize download of certificate (Public)
 * Validates details before allowing download
 */
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId, studentName, orgName } = req.body;

    if (!certificateId || !studentName || !orgName) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID, Student Name, and Organization Name are required"
      });
    }

    const query = {
      certificateId: { $regex: new RegExp(`^${certificateId}$`, "i") }
    };

    const certificate = await Certificate.findOne(query).populate("orgId");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate details do not match our records."
      });
    }

    // Validate Student Name (Case Insensitive Fuzzy Match?) - Strict as per req? 
    // "Student name matches certificate"
    if (certificate.recipientName.trim().toLowerCase() !== studentName.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Certificate details do not match our records." // vague security message
      });
    }

    // Validate Organization Name
    if (certificate.orgId.name.trim().toLowerCase() !== orgName.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Certificate details do not match our records."
      });
    }

    // Success - Return render data
    res.json({
      success: true,
      message: "Verification successful",
      data: certificate
    });

  } catch (error) {
    console.error("Download certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process download request"
    });
  }
};

/**
 * Find and download certificate WITHOUT ID
 * 🔐 Validates Student Name + Org Name strictly
 * 🔐 Returns list if multiple matches found
 */
const downloadWithoutId = async (req, res) => {
  try {
    const { studentName, orgName } = req.body;

    if (!studentName || !orgName) {
      return res.status(400).json({
        success: false,
        message: "Student Name and Organization Name are required"
      });
    }

    // 1. Find Organization (Case Insensitive Exact Match)
    const org = await Organization.findOne({
      name: { $regex: new RegExp(`^${orgName.trim()}$`, "i") }
    });

    if (!org) {
      // Security: Generic error
      return res.status(404).json({
        success: false,
        message: "No certificates found matching these details."
      });
    }

    // 2. Find Certificates strictly for this Org and Student Name
    const certificates = await Certificate.find({
      orgId: org._id,
      recipientName: { $regex: new RegExp(`^${studentName.trim()}$`, "i") },
      status: "ACTIVE" // Only active certificates
    })
      .populate("orgId", "name logo")
      .select("certificateId recipientName courseName issueDate renderData");

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No certificates found matching these details."
      });
    }

    // 3. Handle Results
    if (certificates.length === 1) {
      // Single match - Return it
      return res.json({
        success: true,
        matchType: "single",
        data: certificates[0]
      });
    } else {
      // Multiple matches - Return minimal list for selection
      // Mask ID for security until selected? Actually frontend needs ID to verify.
      // Since user authenticated via Name+Org, it's okay to return list of THEIR certificates.
      const list = certificates.map(cert => ({
        certificateId: cert.certificateId,
        courseName: cert.courseName,
        issueDate: cert.issueDate,
        recipientName: cert.recipientName
      }));

      return res.json({
        success: true,
        matchType: "multiple",
        data: list
      });
    }

  } catch (error) {
    console.error("Download without ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request"
    });
  }
};

/**
 * Get analytics data for the organization
 * Gated by checkPlanPermission('analytics')
 */
const getAnalyticsData = async (req, res) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.user.orgId);

    // Fetch certificates for this org
    const certificates = await Certificate.find({ orgId }).populate("issuedBy", "name");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const analytics = {
      totalCertificates: certificates.length,
      activeCertificates: certificates.filter(c => c.status === "ACTIVE" || c.status === "active").length,
      pendingCertificates: certificates.filter(c => c.status === "PENDING" || c.status === "pending").length,
      expiredCertificates: certificates.filter(c => c.expiryDate && new Date(c.expiryDate) < now).length,
      revokedCertificates: certificates.filter(c => c.status === "REVOKED" || c.status === "revoked").length,
      issuedToday: certificates.filter(c => new Date(c.createdAt) >= startOfToday).length,
      issuedThisMonth: certificates.filter(c => new Date(c.createdAt) >= startOfMonth).length,
      byCourse: [],
      byTemplate: [],
      byTeamMember: [],
      monthlyTrends: []
    };

    // Advanced groupings
    const courseMap = {};
    const teamMap = {};

    certificates.forEach(c => {
      courseMap[c.courseName] = (courseMap[c.courseName] || 0) + 1;
      const teamName = c.issuedBy?.name || "Unknown";
      teamMap[teamName] = (teamMap[teamName] || 0) + 1;
    });

    analytics.byCourse = Object.entries(courseMap)
      .map(([courseName, count]) => ({ courseName, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    analytics.byTeamMember = Object.entries(teamMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    // Monthly trends (6 months)
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const count = certificates.filter(c => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;
      analytics.monthlyTrends.push({ month: monthName, count });
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to generate analytics" });
  }
};

module.exports = {
  issueCertificate,
  getCertificates,
  getAnalyticsData,
  bulkIssueCertificates,
  getAllCertificates,
  deleteCertificate,
  verifyCertificate,
  downloadCertificate,
  downloadWithoutId,
};
