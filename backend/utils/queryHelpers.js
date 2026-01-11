/**
 * Query Helpers
 * Utilities for enforcing multi-tenant isolation and security
 */

/**
 * Add organization filter to query (multi-tenant isolation)
 * SUPER_ADMIN can bypass this filter
 * 
 * @param {Object} query - Mongoose query object
 * @param {string} orgId - Organization ID
 * @param {string} userRole - User role (ORG_ADMIN or SUPER_ADMIN)
 * @returns {Object} Modified query with orgId filter (if applicable)
 */
function addOrgFilter(query, orgId, userRole) {
  // SUPER_ADMIN can access all organizations
  if (userRole === 'SUPER_ADMIN') {
    return query;
  }

  // ORG_ADMIN must be filtered by orgId
  if (!orgId) {
    throw new Error('Organization ID is required for this operation');
  }

  query.orgId = orgId;
  return query;
}

/**
 * Build query with organization isolation
 * 
 * @param {Object} baseQuery - Base query object
 * @param {string} orgId - Organization ID
 * @param {string} userRole - User role
 * @returns {Object} Query with orgId filter applied
 */
function buildOrgQuery(baseQuery = {}, orgId, userRole) {
  const query = { ...baseQuery };
  return addOrgFilter(query, orgId, userRole);
}

/**
 * Validate organization access
 * 
 * @param {string} requestedOrgId - Organization ID being accessed
 * @param {string} userOrgId - User's organization ID
 * @param {string} userRole - User role
 * @returns {boolean} True if access is allowed
 */
function validateOrgAccess(requestedOrgId, userOrgId, userRole) {
  // SUPER_ADMIN has access to all organizations
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // ORG_ADMIN can only access their own organization
  if (requestedOrgId && requestedOrgId.toString() === userOrgId?.toString()) {
    return true;
  }

  return false;
}

module.exports = {
  addOrgFilter,
  buildOrgQuery,
  validateOrgAccess,
};

