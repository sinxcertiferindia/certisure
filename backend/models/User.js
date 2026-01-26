/**
 * User Model
 * SECURITY CRITICAL: Handles user authentication, password hashing, and account security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Password strength validation regex
// Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true, // Critical for multi-tenant queries
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Critical for login queries
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
      select: false, // Security: Don't expose OTP
    },
    emailOtpExpires: {
      type: Date,
      select: false,
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid mobile number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['ORG_ADMIN', 'TEAM_MEMBER', 'SUPER_ADMIN'],
      default: 'TEAM_MEMBER',
      required: true,
    },
    post: {
      type: String,
      trim: true,
      maxlength: [100, 'Post/Role cannot exceed 100 characters'],
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // For filtering active users
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema are saved
  }
);

// Compound indexes for common query patterns
userSchema.index({ orgId: 1, email: 1 });
userSchema.index({ orgId: 1, isActive: 1 });
userSchema.index({ orgId: 1, role: 1 });

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save hook: Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Validate password strength
  if (!PASSWORD_REGEX.test(this.password)) {
    const error = new Error(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    );
    error.name = 'ValidationError';
    return next(error);
  }

  try {
    // Hash password with bcrypt (12 rounds for security)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save hook: Ensure email is lowercase
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Increment failed login attempts
 * Lock account after MAX_LOGIN_ATTEMPTS failed attempts
 */
userSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after MAX_LOGIN_ATTEMPTS failed attempts
  if (this.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

/**
 * Reset failed login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Update last login timestamp
 */
userSchema.methods.updateLastLogin = async function () {
  return this.updateOne({
    $set: { lastLogin: new Date() },
  });
};

// Transform output: remove sensitive fields
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.failedLoginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

