# 🚀 Quick Start Guide - HealthAI Platform

This guide will help you get the entire HealthAI platform up and running in minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 16+ installed ([Download](https://nodejs.org/))
- ✅ Python 3.8+ installed ([Download](https://www.python.org/))
- ✅ PostgreSQL 14+ or Docker installed
- ✅ Git installed

## 🎯 Quick Start (3 Steps)

### Step 1: Setup Database

#### Option A: Using Docker (Recommended)

```powershell
# Start PostgreSQL in Docker
docker run --name postgres-health -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=healthai -p 5432:5432 -d postgres:14
```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database named `healthai`
3. Update the connection string in `backend/.env`

### Step 2: Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (generate a random string)
# - CLOUDINARY credentials (sign up at cloudinary.com)
# - GOOGLE_API_KEY (get from Google AI Studio)

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start the backend server
npm start
```

**Backend will run on:** http://localhost:3000

### Step 3: Setup Frontend

```powershell
# Open a new terminal
cd frontend

# Install dependencies (already done if you followed setup)
npm install

# Create .env file (already created)
# Verify .env contains:
# VITE_API_URL=http://localhost:3000/api

# Start the development server
npm run dev
```

**Frontend will run on:** http://localhost:5173

### Step 4: Setup Python ML Server

```powershell
# Open a new terminal
cd ..

# Install Python dependencies
pip install flask flask-cors tensorflow pillow numpy

# Start the Python server
python app.py
```

**Python ML Server will run on:** http://localhost:5000

## ✅ Verify Installation

1. **Backend Health Check**

   ```powershell
   curl http://localhost:3000/api/health
   ```

   Should return: `{"status":"OK"}`

2. **Python Server Health Check**

   ```powershell
   curl http://localhost:5000/health
   ```

   Should return: `{"status":"ok"}`

3. **Frontend**
   - Open http://localhost:5173
   - You should see the landing page

## 🎮 Using the Platform

### First Time User Journey

1. **Visit Homepage**

   - Navigate to http://localhost:5173
   - Click "Sign Up"

2. **Create Account**

   - Enter email and password
   - Click "Create Account"

3. **Complete Onboarding** (4 Steps)

   - **Step 1**: Personal Information
     - Full name, date of birth, gender, phone
     - Emergency contact details
   - **Step 2**: Medical History
     - Blood type, allergies, chronic conditions
     - Current medications, past surgeries
     - Family health history
   - **Step 3**: Lifestyle
     - Height, weight, smoking status
     - Exercise frequency, diet type
     - Sleep hours, occupation
   - **Step 4**: Health Goals
     - Current symptoms
     - Health concerns
     - Select health goals

4. **Explore Dashboard**

   - View health statistics
   - Check recent scans
   - See AI recommendations

5. **Upload CT Scan**

   - Click "Detection" in sidebar
   - Drag & drop or browse for CT scan image
   - Click "Analyze Scan"
   - View results with AI recommendations

6. **Chat with AI Assistant**

   - Click floating chat button (bottom-right)
   - Ask health questions
   - Get personalized responses

7. **Track Health Metrics**

   - Navigate to "Health Logs"
   - Add vitals (blood pressure, heart rate, etc.)
   - View historical data

8. **Manage Medications**
   - Go to "Medications"
   - Add prescriptions
   - Track active medications

## 🛠️ Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/healthai"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV=development

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Gemini AI
GOOGLE_API_KEY="your-google-ai-api-key"

# Python ML Server
PYTHON_SERVER_URL="http://localhost:5000"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_PYTHON_SERVER_URL=http://localhost:5000
```

## 📦 Project Structure

```
kidney-disease/
├── backend/                    # Node.js Express backend
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   ├── config/           # Database, Cloudinary, Gemini
│   │   ├── utils/            # Helper functions
│   │   └── prisma/           # Database schema
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── services/        # API service
│   │   └── App_New.jsx
│   ├── package.json
│   └── .env
├── app.py                    # Python Flask ML server
└── kidney-classifier/        # ML model files
    ├── saved_model/
    └── kidney-ct-scan-image/
```

## 🔧 Common Issues & Solutions

### Database Connection Error

**Problem:** Backend can't connect to PostgreSQL

**Solution:**

```powershell
# Check if PostgreSQL is running
docker ps

# Restart the container
docker restart postgres-health

# Or start a new one
docker run --name postgres-health -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=healthai -p 5432:5432 -d postgres:14
```

### Port Already in Use

**Problem:** Port 3000, 5000, or 5173 is already in use

**Solution:**

```powershell
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in .env files
```

### Python Dependencies Missing

**Problem:** Python server fails to start

**Solution:**

```powershell
# Install all required packages
pip install flask flask-cors tensorflow pillow numpy

# If you encounter version conflicts
pip install --upgrade tensorflow
```

### Frontend Can't Connect to Backend

**Problem:** API calls fail with CORS or connection errors

**Solution:**

1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check VITE_API_URL in frontend/.env
3. Ensure CORS is enabled in backend (already configured)

### Model File Not Found

**Problem:** Python server can't find the ML model

**Solution:**

```powershell
# Verify model file exists
ls kidney-classifier/saved_model/vgg16_model.h5

# If missing, ensure you have the trained model
# The model should be in: kidney-classifier/saved_model/vgg16_model.h5
```

## 📊 API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile

- `POST /api/profile` - Create profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

### Detection

- `POST /api/detection/upload` - Upload CT scan
- `GET /api/detection/history` - Get history
- `GET /api/detection/:id` - Get specific detection

### Chat

- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Health Logs

- `POST /api/health-log` - Create log
- `GET /api/health-log` - Get logs

### Medications

- `POST /api/medication` - Add medication
- `GET /api/medication` - Get medications
- `PUT /api/medication/:id` - Update medication
- `DELETE /api/medication/:id` - Delete medication

### Dashboard

- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent-detections` - Recent scans
- `GET /api/dashboard/health-trends` - Health trends

## 🎨 Features Overview

### ✨ Core Features

- [x] User Authentication (JWT)
- [x] Multi-step Profile Onboarding
- [x] CT Scan Upload & Analysis
- [x] AI-Powered Disease Detection (4 classes)
- [x] Google Gemini AI Integration
- [x] Context-Aware Chatbot
- [x] Health Dashboard
- [x] Detection History
- [x] Health Vitals Tracking
- [x] Medication Management
- [x] Profile Management

### 🔮 Advanced Features

- [x] Risk Score Calculation
- [x] BMI Calculation
- [x] Health Trends Analysis
- [x] Secure Image Storage (Cloudinary)
- [x] Real-time AI Recommendations
- [x] Responsive Design
- [x] Toast Notifications

## 🚀 Development Tips

### Hot Reload

Both frontend and backend support hot reload:

- Frontend: Vite automatically reloads on file changes
- Backend: Use `nodemon` for auto-restart (install: `npm install -g nodemon`)

### Database Changes

After modifying Prisma schema:

```powershell
npx prisma migrate dev --name description
npx prisma generate
```

### Clear Data

```powershell
# Reset database
npx prisma migrate reset

# This will:
# - Drop database
# - Create new database
# - Run all migrations
# - Run seed (if configured)
```

## 📚 Additional Resources

### Documentation

- Backend API: `backend/README.md`
- Frontend: `frontend/FRONTEND_README.md`
- Implementation Summary: `backend/IMPLEMENTATION_SUMMARY.md`

### External APIs

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Google Gemini AI](https://ai.google.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎉 Success!

If you've followed all steps, you should now have:

- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:5173
- ✅ Python ML server running on http://localhost:5000
- ✅ PostgreSQL database ready
- ✅ Full platform functionality

You're ready to start using HealthAI! 🎊

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the terminal logs for errors
3. Verify all environment variables are set
4. Ensure all services are running
5. Check the documentation files

Happy coding! 💻✨
