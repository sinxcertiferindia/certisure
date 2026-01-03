# Backend Database Layer

Secure, scalable, multi-tenant database layer for CertiFlow Pro.

## 📁 Structure

```
backend/
├── models/
│   ├── User.js                    # User model with password hashing & security
│   ├── Organization.js            # Organization model
│   ├── Certificate.js             # Certificate model with UUID generation
│   ├── CertificateTemplate.js     # Template model with encrypted canvasJSON
│   ├── EmailTemplate.js           # Email template with encrypted htmlBody
│   ├── AuditLog.js                # Audit logging for compliance
│   └── index.js                   # Central model exports
├── utils/
│   ├── encryption.js              # AES-256 encryption utilities
│   └── queryHelpers.js            # Multi-tenant query helpers
└── config/
    └── database.js                # MongoDB connection configuration
```

## 🔐 Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Password strength validation** (min 8 chars, uppercase, lowercase, number, special char)
- **Account lockout** after 5 failed login attempts (2-hour lock)
- Passwords never returned in queries (select: false)

### Data Encryption
- **AES-256-GCM encryption** for sensitive data at rest
- Encrypted fields:
  - `canvasJSON` in CertificateTemplate
  - `htmlBody` in EmailTemplate
- Uses PBKDF2 key derivation with 100,000 iterations

### Multi-Tenant Isolation
- All collections include `orgId` field (indexed)
- Query helpers enforce organization-level isolation
- SUPER_ADMIN can bypass orgId filters
- ORG_ADMIN restricted to their organization

### Audit Logging
- Comprehensive audit trail for all critical actions
- Tracks: user, action, entity, IP address, user agent
- Auto-cleanup after 7 years (configurable)

## 📊 Collections

### User
- Email (unique, indexed)
- Password (hashed, never exposed)
- Role (ORG_ADMIN, SUPER_ADMIN)
- Account lockout logic
- Last login tracking

### Organization
- Subscription management
- Status tracking (ACTIVE, SUSPENDED, CANCELLED, TRIAL)
- Plan types (FREE, PRO, ENTERPRISE)

### Certificate
- Non-guessable UUID certificate IDs
- Status tracking (ACTIVE, REVOKED, EXPIRED)
- Auto-expiration handling

### CertificateTemplate
- Encrypted canvas JSON
- Default template support
- Organization-scoped

### EmailTemplate
- Encrypted HTML body
- Default template support
- Certificate type association

### AuditLog
- Comprehensive action tracking
- IP address and user agent logging
- Time-based indexing for performance

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   npm install mongoose bcrypt uuid
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   ```env
   MONGO_URI=mongodb://localhost:27017/certiflow_pro
   JWT_SECRET=your-secret-key
   DB_ENCRYPTION_KEY=your-32-char-encryption-key
   ```

3. **Connect to Database**
   ```javascript
   const { connectDatabase } = require('./config/database');
   await connectDatabase(process.env.MONGO_URI);
   ```

4. **Use Models**
   ```javascript
   const { User, Organization, Certificate } = require('./models');
   
   // Create user (password auto-hashed)
   const user = await User.create({
     orgId: org._id,
     name: 'John Doe',
     email: 'john@example.com',
     password: 'SecurePass123!',
     role: 'ORG_ADMIN'
   });
   
   // Compare password
   const isValid = await user.comparePassword('SecurePass123!');
   ```

## 🔒 Security Best Practices

1. **Never store plain passwords** - Always use the model's password field (auto-hashed)
2. **Use query helpers** - Always use `buildOrgQuery()` for multi-tenant queries
3. **Encrypt sensitive data** - Templates automatically encrypt/decrypt
4. **Audit critical actions** - Log all certificate issues, template changes, etc.
5. **Validate organization access** - Use `validateOrgAccess()` before operations
6. **Use indexes** - All critical fields are indexed for performance

## 📝 Usage Examples

### Creating a User
```javascript
const user = await User.create({
  orgId: organizationId,
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'SecurePass123!', // Auto-hashed
  role: 'ORG_ADMIN'
});
```

### Authentication
```javascript
const user = await User.findOne({ email: 'jane@example.com' })
  .select('+password'); // Explicitly select password

if (!user || user.isLocked) {
  throw new Error('Account locked or user not found');
}

const isValid = await user.comparePassword('password123');
if (!isValid) {
  await user.incLoginAttempts();
  throw new Error('Invalid password');
}

await user.resetLoginAttempts();
await user.updateLastLogin();
```

### Multi-Tenant Query
```javascript
const { buildOrgQuery } = require('./utils/queryHelpers');

const certificates = await Certificate.find(
  buildOrgQuery({ status: 'ACTIVE' }, user.orgId, user.role)
);
```

### Encrypted Template
```javascript
// Create template (auto-encrypts)
const template = await CertificateTemplate.create({
  orgId: orgId,
  templateName: 'My Template',
  canvasJSON: JSON.stringify({ ... }), // Auto-encrypted
  createdBy: userId
});

// Retrieve and decrypt
const template = await CertificateTemplate.findById(templateId);
const canvasJSON = template.getDecryptedCanvasJSON();
```

### Audit Logging
```javascript
await AuditLog.create({
  orgId: user.orgId,
  userId: user._id,
  action: 'CERTIFICATE_ISSUED',
  entityType: 'CERTIFICATE',
  entityId: certificate._id,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: { recipientEmail: 'user@example.com' }
});
```

## ⚠️ Important Notes

- **Encryption Key**: Generate a secure 32+ character key for `DB_ENCRYPTION_KEY`
- **Password Policy**: Enforced at schema level (8+ chars, mixed case, number, special char)
- **Account Lockout**: 5 failed attempts = 2-hour lock
- **Indexes**: All critical fields indexed for performance
- **Soft Deletes**: Use `isActive: false` instead of deleting records
- **Timestamps**: All models include `createdAt` and `updatedAt`

## 🔄 Migration Notes

If you have existing data:
1. Users with plain passwords need to be migrated (hash existing passwords)
2. Existing templates need to be encrypted (run migration script)
3. Ensure all records have `orgId` populated
4. Create indexes using MongoDB commands if needed

