/**
 * Email Template Model
 * Stores email templates with encrypted HTML body
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { encrypt, decrypt } = require('../utils/encryption');

const emailTemplateSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true, // Critical for multi-tenant queries
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [200, 'Template name cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
      maxlength: [500, 'Subject cannot exceed 500 characters'],
    },
    htmlBody: {
      type: String,
      required: [true, 'HTML body is required'],
      // This will be encrypted before saving
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true, // For finding default templates
    },
    certificateType: {
      type: String,
      trim: true,
      maxlength: [100, 'Certificate type cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
emailTemplateSchema.index({ orgId: 1, isDefault: 1 });
emailTemplateSchema.index({ orgId: 1, certificateType: 1 });
emailTemplateSchema.index({ orgId: 1, createdAt: -1 });

// Pre-save hook: Encrypt htmlBody before saving
emailTemplateSchema.pre('save', async function (next) {
  // Only encrypt if htmlBody is modified
  if (this.isModified('htmlBody') && this.htmlBody) {
    try {
      const encryptionKey = process.env.DB_ENCRYPTION_KEY;
      if (!encryptionKey) {
        return next(new Error('DB_ENCRYPTION_KEY is required in environment variables'));
      }

      // Encrypt the HTML body
      this.htmlBody = encrypt(this.htmlBody, encryptionKey);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Instance method: Decrypt htmlBody after retrieving
emailTemplateSchema.methods.getDecryptedHtmlBody = function () {
  try {
    const encryptionKey = process.env.DB_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('DB_ENCRYPTION_KEY is required in environment variables');
    }

    if (!this.htmlBody) {
      return null;
    }

    return decrypt(this.htmlBody, encryptionKey);
  } catch (error) {
    throw new Error(`Failed to decrypt HTML body: ${error.message}`);
  }
};

// Override toJSON to exclude encrypted htmlBody by default
// Use getDecryptedHtmlBody() method explicitly when needed
emailTemplateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Don't expose encrypted data by default
  delete obj.htmlBody;
  return obj;
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;

