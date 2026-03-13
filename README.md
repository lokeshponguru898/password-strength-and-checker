# Password Strength Checker - Full Stack Application

A complete full-stack web application for checking password strength, generating secure passwords, and managing password history.

## Tech Stack

### Frontend
- Vite
- Vanilla JavaScript (ES6+)
- Axios for API calls
- HTML5 & CSS3

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
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

## Setup Instructions

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Configure Backend
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/password-checker
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. Run the Application

#### Development Mode (Recommended)
Open two terminals:

Terminal 1 - Backend:
```bash
npm run server:dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Access the app at: http://localhost:3000

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm run server

# Serve built files (use a static server)
npm run preview
```

## Features

### 1. Authentication
- User signup with validation
- Secure login with JWT tokens
- Protected routes
- Logout functionality

### 2. Password Strength Checker
- Real-time password strength analysis
- Strength levels: Very Weak, Weak, Medium, Strong, Very Strong
- Detailed feedback on password improvements
- Visual strength indicator

### 3. Password Generator
- Generate secure random passwords
- Customizable length (8-128 characters)
- Includes uppercase, lowercase, numbers, and special characters
- One-click copy to clipboard

### 4. Password History
- Automatic storage of checked/generated passwords
- View all passwords or filter strong ones only
- Configurable history limit
- Clear history option

### 5. User Profile
- Update personal information
- Manage first name, last name, age, email, and bio

### 6. Account Settings
- Auto logout time configuration
- Password history limit adjustment
- Enable/disable notifications

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Password
- `POST /api/password/check` - Check password strength
- `POST /api/password/generate` - Generate strong password
- `GET /api/password/history` - Get password history
- `GET /api/password/history?strongOnly=true` - Get strong passwords only
- `DELETE /api/password/history` - Clear password history

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- CORS enabled
- Secure password generation using crypto-random methods

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
