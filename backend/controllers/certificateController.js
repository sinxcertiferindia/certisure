const { Certificate, CertificateTemplate, AuditLog } = require("../models");
const { buildOrgQuery } = require("../utils/queryHelpers");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Issue a new certificate
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
    } = req.body;

    // Validate required fields
    if (!recipientName || !recipientEmail || !courseName) {
      return res.status(400).json({ 
        success: false,
        message: "recipientName, recipientEmail, and courseName are required" 
      });
    }

    // If templateId provided, validate ObjectId format and verify it belongs to organization
    if (templateId) {
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
      batchName: batchName || undefined,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: "ACTIVE",
      certificateId: uuidv4(), // Generate UUID for certificate ID
    };

    // Only include templateId if it's a valid ObjectId
    if (templateId && mongoose.Types.ObjectId.isValid(templateId)) {
      certificateData.templateId = templateId;
    }

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
const getCertificates = async (req, res) => {
  try {
    // 🔐 SECURITY: orgId comes ONLY from JWT token
    const orgId = req.user.orgId;

    if (!orgId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized: Missing organization context" 
      });
    }

    // 🔐 CRITICAL: Always filter by orgId - never fetch all certificates
    const certificates = await Certificate.find({
      orgId: orgId, // 🔐 ORGANIZATION ISOLATION - No exceptions
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

module.exports = {
  issueCertificate,
  getCertificates,
};

