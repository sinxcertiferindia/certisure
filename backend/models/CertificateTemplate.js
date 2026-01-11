/**
 * Certificate Template Model
 * Stores certificate templates with encrypted canvas JSON
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { encrypt, decrypt } = require('../utils/encryption');

const certificateTemplateSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true, // Critical for multi-tenant queries
    },
    templateName: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [200, 'Template name cannot exceed 200 characters'],
    },
    canvasJSON: {
      type: String,
      required: [true, 'Canvas JSON is required'],
      // This will be encrypted before saving
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true, // For finding default templates
    },
    width: {
      type: Number,
      default: 297,
    },
    height: {
      type: Number,
      default: 210,
    },
    unit: {
      type: String,
      enum: ['mm', 'px', 'in'],
      default: 'mm',
    },
    orientation: {
      type: String,
      enum: ['landscape', 'portrait'],
      default: 'landscape',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    backgroundImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
certificateTemplateSchema.index({ orgId: 1, isDefault: 1 });
certificateTemplateSchema.index({ orgId: 1, createdAt: -1 });

// Pre-save hook: Encrypt canvasJSON before saving
certificateTemplateSchema.pre('save', async function (next) {
  // Only encrypt if canvasJSON is modified and not already encrypted (basic check)
  if (this.isModified('canvasJSON') && this.canvasJSON) {
    try {
      const encryptionKey = process.env.DB_ENCRYPTION_KEY;
      if (!encryptionKey) {
        return next(new Error('DB_ENCRYPTION_KEY is required in environment variables'));
      }

      // Encrypt the canvas JSON
      this.canvasJSON = encrypt(this.canvasJSON, encryptionKey);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Post-find hook: Decrypt canvasJSON after retrieving
// Note: Mongoose doesn't have post-find hooks, so we'll use instance methods instead
certificateTemplateSchema.methods.getDecryptedCanvasJSON = function () {
  try {
    const encryptionKey = process.env.DB_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('DB_ENCRYPTION_KEY is required in environment variables');
    }

    if (!this.canvasJSON) {
      return null;
    }

    return decrypt(this.canvasJSON, encryptionKey);
  } catch (error) {
    throw new Error(`Failed to decrypt canvas JSON: ${error.message}`);
  }
};

// Override toJSON to include decrypted canvasJSON when needed
// For security, by default we don't include canvasJSON in JSON output
// Use getDecryptedCanvasJSON() method explicitly when needed
certificateTemplateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Don't expose encrypted data by default
  delete obj.canvasJSON;
  return obj;
};

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);

module.exports = CertificateTemplate;

