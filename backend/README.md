# 🏥 Health Monitoring Platform - Backend

Complete backend system for an AI-powered health monitoring and disease detection platform built with Node.js, Express, Prisma, PostgreSQL, and integrated with Google Gemini AI.

## 🚀 Features

### Core Features

- ✅ **User Authentication** - JWT-based auth with email verification
- ✅ **User Profile Management** - Complete health profiles with BMI auto-calculation
- ✅ **Medical History Tracking** - Personal and family medical history
- ✅ **AI-Powered Disease Detection** - Upload medical images for instant analysis
- ✅ **Smart Health Chatbot** - Context-aware AI assistant using Gemini
- ✅ **Health Dashboard** - Comprehensive health metrics and analytics
- ✅ **Health Logs** - Track vitals, weight, BP, blood sugar
- ✅ **Medication Management** - Track medications and reminders
- ✅ **Risk Assessment** - AI-calculated health risk scores

### Technical Features

- 🔐 Secure authentication with JWT and bcrypt
- 📊 PostgreSQL database with Prisma ORM
- ☁️ Cloudinary integration for image storage
- 🤖 Google Gemini AI for health insights
- 🐍 Python ML server integration (independent service)
- 🛡️ Input validation and sanitization
- 📝 Comprehensive error handling
- 🚦 Rate limiting and security headers

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client setup
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── gemini.js          # Google Gemini AI setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── detection.controller.js
│   │   ├── chat.controller.js
│   │   ├── healthLog.controller.js
│   │   ├── medication.controller.js
│   │   └── dashboard.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── detection.routes.js
│   │   ├── chat.routes.js
│   │   ├── healthLog.routes.js
│   │   ├── medication.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── upload.js          # Multer configuration
│   └── utils/
│       ├── helpers.js         # Utility functions
│       └── validators.js      # Input validation
├── .env.example
├── server.js                  # Express server
└── package.json
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Python ML server running (for disease detection)

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/health_platform_db"

# JWT
JWT_SECRET="your-secret-key-change-this"

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google Gemini AI (Get key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="your-gemini-api-key"

# Python ML Server
PYTHON_SERVER_URL="http://localhost:5000"

# Frontend
CORS_ORIGIN="http://localhost:5173"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Profile Endpoints

#### Create Profile

```http
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "height": 175,
  "weight": 75,
  "phone": "9876543210",
  "healthGoal": "GENERAL_WELLNESS"
}
```

#### Update Medical History

```http
PUT /api/profile/medical-history
Authorization: Bearer <token>
Content-Type: application/json

{
  "diabetes": false,
  "hypertension": true,
  "sleepHours": "SEVEN_TO_EIGHT",
  "activityLevel": "MODERATE",
  "smoking": false,
  "alcohol": false
}
```

### Disease Detection Endpoints

#### Upload Image for Detection

```http
POST /api/detection/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
detectionType: KIDNEY_DISEASE
```

Response:

```json
{
  "success": true,
  "message": "Image processed successfully",
  "data": {
    "detection": {
      "id": "...",
      "prediction": "Normal",
      "confidence": 0.95,
      "probabilities": {...},
      "aiSuggestions": "...",
      "riskLevel": "LOW",
      "riskScore": 12.5
    }
  }
}
```

#### Get Detection History

```http
GET /api/detection/history?limit=20&offset=0
Authorization: Bearer <token>
```

### Chat Endpoints

#### Send Message

```http
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What should I do if I have high blood pressure?"
}
```

#### Get Chat History

```http
GET /api/chat/history?limit=50
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Data

```http
GET /api/dashboard
Authorization: Bearer <token>
```

Response includes:

- User profile
- Medical history
- Recent detections
- Health logs
- Active medications
- Risk assessment

#### Get Health Risk Score

```http
GET /api/dashboard/risk-score
Authorization: Bearer <token>
```

### Health Logs Endpoints

#### Create Health Log

```http
POST /api/health-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "bloodSugar": 95,
  "weight": 75.5
}
```

### Medications Endpoints

#### Add Medication

```http
POST /api/medications
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "Once daily",
  "startDate": "2025-01-01",
  "reminderTimes": ["09:00"]
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with configurable rounds
- **Input Validation** - express-validator for all inputs
- **Rate Limiting** - Prevent brute force attacks
- **Helmet.js** - Security headers
- **CORS** - Configured cross-origin requests
- **SQL Injection Protection** - Prisma ORM parameterized queries

## 🐍 Python ML Server Integration

The backend communicates with an independent Python server for disease detection:

**Flow:**

1. User uploads image → Node backend
2. Backend uploads to Cloudinary (for storage)
3. Backend sends base64 image to Python server
4. Python server runs ML model prediction
5. Backend receives prediction
6. Backend generates AI suggestions using Gemini
7. Results saved to database
8. Response sent to user

**Privacy:** Python server doesn't have Cloudinary access - images sent directly as base64.

## 🤖 AI Features

### 1. Disease Detection Suggestions

After each detection, Gemini AI generates personalized recommendations based on:

- Prediction result
- User's age, gender, BMI
- Medical history
- Lifestyle factors

### 2. Health Chatbot

Context-aware chatbot that knows:

- User's profile and medical history
- Recent detection results
- Current health metrics
- Previous conversation

### 3. Risk Assessment

AI calculates comprehensive health risk scores considering:

- BMI and age
- Pre-existing conditions
- Lifestyle factors
- Recent detection history

## 📊 Database Models

Key models in Prisma schema:

- `User` - Authentication and core user data
- `Profile` - Personal information and health metrics
- `MedicalHistory` - Medical conditions and lifestyle
- `DetectionHistory` - Disease detection results
- `ChatMessage` - AI chatbot conversations
- `HealthLog` - Daily health vitals tracking
- `Medication` - Medication management
- `FamilyMember` - Family health history
- `HabitLog` - Daily habit tracking

## 🔧 Development

### Database Management

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (caution!)
npx prisma migrate reset
```

### Debugging

Enable debug logging by setting in `.env`:

```env
NODE_ENV=development
```

View Prisma query logs in console during development.

## 🚀 Deployment

### Environment Variables Checklist

- [ ] `DATABASE_URL` - Production PostgreSQL URL
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `CLOUDINARY_*` - Cloudinary credentials
- [ ] `GEMINI_API_KEY` - Google AI API key
- [ ] `PYTHON_SERVER_URL` - Production ML server URL
- [ ] `CORS_ORIGIN` - Production frontend URL
- [ ] `NODE_ENV=production`

### Production Recommendations

- Use environment secrets management
- Enable HTTPS
- Set up database backups
- Configure CDN for static assets
- Monitor error logs
- Set up health check endpoints
- Use process manager (PM2)

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test Python server connection
curl http://localhost:3000/api/python-health
```

## 📝 Notes

- Email verification system is set up but needs SMTP configuration
- Add `.env` to `.gitignore` (already included)
- Regular database backups recommended
- Monitor Gemini API usage and quotas
- Keep Prisma Client up to date

## 🤝 Support

For issues or questions:

1. Check logs in console
2. Verify all environment variables are set
3. Ensure Python ML server is running
4. Check database connection

## 📄 License

ISC

---

Built with ❤️ for better healthcare accessibility
