# Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 2. Configure Backend

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/password-checker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### 3. Start MongoDB

Windows:
```bash
net start MongoDB
```

macOS/Linux:
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 4. Run the Application

#### Option 1: Development Mode (Recommended)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the application at: **http://localhost:3000**

#### Option 2: Production Build

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## Project Structure

```
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & validation
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Entry point
│   └── package.json        # Backend dependencies
├── src/                    # Frontend source
│   ├── api/                # API client functions
│   ├── components/         # Reusable components
│   ├── pages/              # Page-specific JS
│   └── utils/              # Utility functions
├── *.html                  # HTML pages
├── *.css                   # Stylesheets
├── vite.config.js          # Vite configuration
└── package.json            # Frontend dependencies
```

## Testing the API

### Using curl:

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Check Password (replace YOUR_TOKEN):**
```bash
curl -X POST http://localhost:5000/api/password/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"password":"MyP@ssw0rd123"}'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the MONGODB_URI in backend/.env
- Verify MongoDB is accessible on port 27017

### Port Already in Use
- Frontend (3000): Change port in vite.config.js
- Backend (5000): Change PORT in backend/.env

### CORS Errors
- Ensure backend is running on port 5000
- Check proxy configuration in vite.config.js

## Features

- ✅ User authentication (signup/login)
- ✅ Password strength checking
- ✅ Secure password generation
- ✅ Password history tracking
- ✅ User profile management
- ✅ Account settings
- ✅ JWT token authentication
- ✅ bcrypt password hashing

## API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login

### Profile
- GET /api/profile
- PUT /api/profile

### Password
- POST /api/password/check
- POST /api/password/generate
- GET /api/password/history
- DELETE /api/password/history

### Settings
- GET /api/settings
- PUT /api/settings
