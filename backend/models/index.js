/**
 * Models Index
 * Central export point for all database models
 */

const User = require('./User');
const Organization = require('./Organization');
const Certificate = require('./Certificate');
const CertificateTemplate = require('./CertificateTemplate');
const EmailTemplate = require('./EmailTemplate');
const AuditLog = require('./AuditLog');
const Plan = require('./Plan');

module.exports = {
  User,
  Organization,
  Certificate,
  CertificateTemplate,
  EmailTemplate,
  AuditLog,
  Plan,
};

