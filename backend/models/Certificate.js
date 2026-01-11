/**
 * Certificate Model
 * Stores issued certificates with multi-tenant isolation
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Schema } = mongoose;

const certificateSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true, // Critical for multi-tenant queries
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      maxlength: [200, 'Recipient name cannot exceed 200 characters'],
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [300, 'Course name cannot exceed 300 characters'],
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'CertificateTemplate',
    },
    batchName: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true, // For filtering by issue date
    },
    expiryDate: {
      type: Date,
    },
    certificateId: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(), // Auto-generate UUID if not provided
      index: true, // Critical for certificate verification
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true, // For filtering by status
    },
    certificateType: {
      type: String,
      enum: ['Completion', 'Participation', 'Achievement'],
      default: 'Completion',
      trim: true,
    },
    renderData: {
      type: Schema.Types.Mixed, // Stores the final merged canvas JSON
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
certificateSchema.index({ orgId: 1, issueDate: -1 }); // For listing certificates by organization
certificateSchema.index({ orgId: 1, status: 1 }); // For filtering by organization and status
certificateSchema.index({ orgId: 1, recipientEmail: 1 }); // For finding certificates by recipient
certificateSchema.index({ certificateId: 1, status: 1 }); // For verification queries

// Pre-save hook: Handle email normalization and status updates
certificateSchema.pre('save', async function (next) {
  // Ensure email is lowercase
  if (this.isModified('recipientEmail')) {
    this.recipientEmail = this.recipientEmail.toLowerCase().trim();
  }

  // Auto-update status to EXPIRED if expiry date has passed
  if (this.expiryDate && new Date(this.expiryDate) < new Date() && this.status === 'ACTIVE') {
    this.status = 'EXPIRED';
  }

  next();
});

// Method to revoke certificate
certificateSchema.methods.revoke = async function (reason) {
  this.status = 'REVOKED';
  return this.save();
};

// Method to check if certificate is valid
certificateSchema.methods.isValid = function () {
  if (this.status !== 'ACTIVE') {
    return false;
  }
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    return false;
  }
  return true;
};

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;

