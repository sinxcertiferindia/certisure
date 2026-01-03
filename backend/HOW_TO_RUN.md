# How to Run / कैसे Run करें

## Step-by-Step Instructions (Hindi & English)

### Step 1: Install Dependencies / Dependencies Install करें

```bash
cd backend
npm install mongoose bcrypt uuid dotenv
```

### Step 2: Setup Environment Variables / Environment Variables Setup करें

1. **Create `.env` file** in the `backend` folder:

```bash
# Windows (PowerShell)
copy ENV_EXAMPLE.txt .env

# Linux/Mac
cp ENV_EXAMPLE.txt .env
```

2. **Edit `.env` file** and add your values:

```env
MONGO_URI=mongodb://localhost:27017/certiflow_pro
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_ENCRYPTION_KEY=your-32-character-encryption-key-here
NODE_ENV=development
PORT=3000
```

3. **Generate Encryption Key** (run this command):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `DB_ENCRYPTION_KEY` in your `.env` file.

### Step 3: Make sure MongoDB is running / MongoDB चल रहा है या नहीं check करें

```bash
# Check if MongoDB is running
# Windows: Check Services or run mongod
# Linux/Mac: sudo systemctl status mongod
```

### Step 4: Use in Your Express Server / Express Server में Use करें

Create a file `backend/index.js` or add to your existing Express server:

```javascript
require('dotenv').config();
const express = require('express');
const { connectDatabase } = require('./config/database');
const { User, Organization, Certificate } = require('./models');

const app = express();
app.use(express.json());

// Connect to database when server starts
connectDatabase(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Database connected');
    
    // Start Express server
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Example API route
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create({
      orgId: req.body.orgId,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // Auto-hashed
      role: req.body.role || 'ORG_ADMIN',
    });
    res.json(user.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Example login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select('+password');
    
    if (!user || user.isLocked) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(req.body.password);
    if (!isValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.resetLoginAttempts();
    await user.updateLastLogin();

    res.json({ user: user.toJSON(), token: 'your-jwt-token-here' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 5: Run the Server / Server Run करें

```bash
# If you created index.js
node backend/index.js

# Or with nodemon (auto-restart on changes)
npm install -g nodemon
nodemon backend/index.js
```

## Quick Test / Quick Test करें

Create a test file `backend/test.js`:

```javascript
require('dotenv').config();
const { connectDatabase } = require('./config/database');
const { User, Organization } = require('./models');

async function test() {
  try {
    // Connect
    await connectDatabase(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Create organization
    const org = await Organization.create({
      name: 'Test Org',
      email: 'test@example.com',
    });
    console.log('✅ Organization created:', org._id);

    // Create user
    const user = await User.create({
      orgId: org._id,
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
      role: 'ORG_ADMIN',
    });
    console.log('✅ User created:', user.email);

    // Test password
    const isValid = await user.comparePassword('Test123!@#');
    console.log('✅ Password test:', isValid ? 'PASSED' : 'FAILED');

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
```

Run the test:

```bash
node backend/test.js
```

## Common Commands / Common Commands

```bash
# Install dependencies
npm install mongoose bcrypt uuid dotenv

# Run test
node backend/test.js

# Run server (if you have index.js)
node backend/index.js

# Check MongoDB connection
mongosh mongodb://localhost:27017/certiflow_pro
```

## Troubleshooting / समस्या निवारण

1. **MongoDB not running**: 
   - Windows: Start MongoDB service
   - Linux: `sudo systemctl start mongod`

2. **Connection error**:
   - Check `MONGO_URI` in `.env` file
   - Make sure MongoDB is accessible

3. **Encryption error**:
   - Make sure `DB_ENCRYPTION_KEY` is set in `.env`
   - Key should be at least 32 characters

4. **Password validation error**:
   - Password must be 8+ characters
   - Must include uppercase, lowercase, number, and special character

## Next Steps / अगले Steps

1. Integrate models into your Express routes
2. Add JWT authentication
3. Create API endpoints for CRUD operations
4. Add middleware for organization isolation
5. Implement audit logging for all actions

## Important Notes / महत्वपूर्ण नोट्स

- ✅ Never store plain passwords - always use User model
- ✅ Always use `buildOrgQuery()` for multi-tenant queries
- ✅ Use `toJSON()` method to exclude sensitive fields
- ✅ Check `isLocked` before authentication
- ✅ Log all critical actions to AuditLog

