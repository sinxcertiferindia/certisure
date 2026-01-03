/**
 * Audit Log Model
 * Tracks all critical actions for compliance and security
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true, // Critical for filtering by organization
      // Note: orgId can be null for SUPER_ADMIN actions
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true, // For tracking user actions
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      maxlength: [100, 'Action cannot exceed 100 characters'],
      index: true, // For filtering by action type
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
      enum: [
        'USER',
        'ORGANIZATION',
        'CERTIFICATE',
        'CERTIFICATE_TEMPLATE',
        'EMAIL_TEMPLATE',
        'AUTH',
        'SYSTEM',
      ],
      index: true, // For filtering by entity type
    },
    entityId: {
      type: Schema.Types.ObjectId,
      // Flexible: can reference any entity
    },
    ipAddress: {
      type: String,
      trim: true,
      index: true, // For security tracking
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      // Store additional context (e.g., changes made, reason for action)
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Critical for time-based queries
    },
  },
  {
    timestamps: false, // We use createdAt explicitly
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
auditLogSchema.index({ orgId: 1, createdAt: -1 }); // Most common: org logs by date
auditLogSchema.index({ userId: 1, createdAt: -1 }); // User action history
auditLogSchema.index({ entityType: 1, entityId: 1 }); // Entity history
auditLogSchema.index({ action: 1, createdAt: -1 }); // Action type over time
auditLogSchema.index({ orgId: 1, action: 1, createdAt: -1 }); // Org-specific actions

// TTL index for automatic cleanup after ~7 years (220752000 seconds)
// Uncomment if you want automatic deletion of old audit logs
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

