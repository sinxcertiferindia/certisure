/**
 * Organization Model
 * Multi-tenant organization structure
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [200, 'Organization name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization type cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Organization email is required'],
      lowercase: true,
      trim: true,
      index: true, // Critical for organization lookups
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
      index: true, // For filtering by plan
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL'],
      default: 'TRIAL',
      index: true, // Critical for subscription management
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
      index: true, // For payment tracking
    },
    accountStatus: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'BLOCKED'],
      default: 'PENDING',
      index: true, // Critical for account access control
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    monthlyCertificateLimit: {
      type: Number,
      default: 50 // Default to FREE plan limit
    },
    certificatesIssuedThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // For filtering active organizations
    },
    logo: {
      type: String,
      trim: true,
      default: null, // Logo URL or path
    },
    certificatePrefixes: [
      {
        type: String,
        trim: true,
        uppercase: true,
        minlength: [2, 'Prefix must be at least 2 characters'],
        maxlength: [10, 'Prefix cannot exceed 10 characters'],
        match: [/^[A-Z0-9]+$/, 'Prefix must be alphanumeric'],
      }
    ],
    defaultCertificatePrefix: {
      type: String,
      trim: true,
      uppercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
organizationSchema.index({ subscriptionStatus: 1, isActive: 1 });
organizationSchema.index({ subscriptionPlan: 1, subscriptionStatus: 1 });
organizationSchema.index({ email: 1, isActive: 1 });
organizationSchema.index({ accountStatus: 1, paymentStatus: 1 });
organizationSchema.index({ accountStatus: 1, subscriptionPlan: 1 });

// Pre-save hook: Ensure email is lowercase
organizationSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;

