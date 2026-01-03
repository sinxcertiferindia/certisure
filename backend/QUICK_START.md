# Quick Start Guide / Quick Start गाइड

## 🚀 3 Simple Steps / 3 आसान Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup .env File
```bash
# Copy the example file
copy ENV_EXAMPLE.txt .env   # Windows
# OR
cp ENV_EXAMPLE.txt .env     # Linux/Mac

# Then edit .env and add:
MONGO_URI=mongodb://localhost:27017/certiflow_pro
DB_ENCRYPTION_KEY=your-32-character-key-here
JWT_SECRET=your-secret-key
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Run Server
```bash
# Make sure MongoDB is running first!

# Option 1: Run server
npm start

# Option 2: Run with auto-restart (dev mode)
npm run dev

# Option 3: Run test
npm test
```

## ✅ Expected Output

```
✅ MongoDB connected successfully
✅ Database connected
✅ Server running on port 3000
📍 Health check: http://localhost:3000/health
```

## 📝 Test API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Create Organization
```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"My Org","email":"org@example.com"}'
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"orgId":"ORG_ID_HERE","name":"John Doe","email":"john@example.com","password":"Secure123!","role":"ORG_ADMIN"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Secure123!"}'
```

## ❗ Common Issues

1. **MongoDB not running**: Start MongoDB service first
2. **Port already in use**: Change PORT in .env file
3. **Connection error**: Check MONGO_URI in .env file
4. **Encryption error**: Make sure DB_ENCRYPTION_KEY is set

## 📚 Full Documentation

See `HOW_TO_RUN.md` for detailed instructions.

