# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL if not installed
# Create a database
createdb health_platform_db
```

**Option B: Use Cloud Database**

- [Supabase](https://supabase.com) - Free PostgreSQL
- [Neon](https://neon.tech) - Serverless Postgres
- [Railway](https://railway.app) - Simple deployment

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
```

**Required credentials:**

1. **Database URL** (PostgreSQL)

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/health_platform_db"
   ```

2. **Cloudinary** (Sign up at https://cloudinary.com)

   ```
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

3. **Google Gemini AI** (Get key from https://aistudio.google.com/app/apikey)

   ```
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **JWT Secret** (Generate a random string)
   ```
   JWT_SECRET="generate-a-random-secret-string-here"
   ```

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Python ML Server

In a separate terminal:

```bash
cd ..
python app.py
```

Ensure Python server is running on `http://localhost:5000`

### 6. Start Node Backend

```bash
# Development mode with auto-reload
npm run dev
```

Backend will run on `http://localhost:3000`

### 7. Test the API

**Health Check:**

```bash
curl http://localhost:3000/health
```

**Register a User:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

## 📝 Next Steps

1. **Create your profile** via `/api/profile` endpoint
2. **Upload medical history** via `/api/profile/medical-history`
3. **Upload CT scan** for detection via `/api/detection/upload`
4. **Chat with AI** via `/api/chat/message`
5. **View dashboard** via `/api/dashboard`

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
psql --version

# Test connection
psql "your_database_url"
```

### Python Server Not Responding

```bash
# Check if Python server is running
curl http://localhost:5000/health

# If not, start it
python app.py
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run db:generate

# If issues persist
rm -rf node_modules
npm install
npm run db:generate
```

## 📚 Important Endpoints

| Endpoint                | Method | Description                |
| ----------------------- | ------ | -------------------------- |
| `/health`               | GET    | Server health check        |
| `/api/auth/register`    | POST   | Register new user          |
| `/api/auth/login`       | POST   | User login                 |
| `/api/profile`          | POST   | Create profile             |
| `/api/detection/upload` | POST   | Upload image for detection |
| `/api/chat/message`     | POST   | Send message to AI chatbot |
| `/api/dashboard`        | GET    | Get dashboard data         |

## 🎯 Testing Workflow

1. Register → Login → Get Token
2. Create Profile with health info
3. Add Medical History
4. Upload a kidney CT scan image
5. View detection result with AI suggestions
6. Ask questions to the chatbot
7. Check your dashboard

## 💡 Pro Tips

- Use Postman or Thunder Client for API testing
- Check `npm run db:studio` for visual database editor
- Monitor logs in the console for debugging
- Keep Python ML server running alongside Node backend
- Test with sample CT scan images from `kidney-classifier/kidney-ct-scan-image/`

## 🆘 Need Help?

Check the main [README.md](README.md) for detailed API documentation!
