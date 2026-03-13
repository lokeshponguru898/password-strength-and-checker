# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Setup Backend

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/password-checker
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

## Step 3: Start MongoDB

Make sure MongoDB is running on your system.

## Step 4: Run the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

## Step 5: Open Browser

Navigate to: **http://localhost:3000**

## 🎉 You're Ready!

1. Sign up for a new account
2. Check password strength
3. Generate secure passwords
4. View your password history

---

For detailed setup instructions, see SETUP.md
