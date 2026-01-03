# ✅ Backend Setup Complete

## What Was Created

### ✅ Backend Structure
- `server.js` - Main entry point
- `app.js` - Express app configuration
- `routes/` - All API routes
- `controllers/` - Business logic
- `middlewares/` - Authentication middleware

### ✅ Routes Created
- `/api/auth/register-org` - Register organization
- `/api/auth/login` - User login
- `/api/org/profile` - Get organization profile
- `/api/certificates` - Issue and get certificates
- `/api/templates/certificate` - Create and get certificate templates

### ✅ Frontend Integration
- `src/services/api.ts` - Axios API service with auth token
- Updated `Auth.tsx` to use real API

## Next Steps to Run

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies (axios)
```bash
# From root directory
npm install
```

### 3. Setup Environment Variables
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/certiflow_pro
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_ENCRYPTION_KEY=your-32-character-encryption-key-here
PORT=3000
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Backend Server
```bash
cd backend
npm start
# or for development
npm run dev
```

### 5. Start Frontend
```bash
# From root directory
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register-org` - Register new organization
- `POST /api/auth/login` - Login user

### Organization
- `GET /api/org/profile` - Get organization profile (requires auth)

### Certificates
- `POST /api/certificates` - Issue certificate (requires auth)
- `GET /api/certificates` - Get all certificates (requires auth)

### Templates
- `POST /api/templates/certificate` - Create certificate template (requires auth)
- `GET /api/templates/certificate` - Get all templates (requires auth)

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

Token is stored in localStorage as `authToken` after login/registration.

## Testing

1. Start backend server on port 3000
2. Start frontend on port 5173 (Vite default)
3. Go to http://localhost:5173/auth?mode=signup
4. Register a new organization
5. Login and test certificate issuance

## Notes

- Backend runs on http://localhost:3000
- Frontend runs on http://localhost:5173
- CORS is configured for frontend origin
- All passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- MongoDB connection is required

