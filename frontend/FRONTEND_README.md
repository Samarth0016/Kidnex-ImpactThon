# HealthAI Frontend

A modern React-based frontend application for the AI-powered health monitoring platform.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 📋 **Multi-step Onboarding** - Comprehensive profile setup with medical history
- 🏥 **Disease Detection** - Upload CT scans for AI-powered kidney disease detection
- 🤖 **AI Chatbot** - Context-aware health assistant powered by Google Gemini
- 📊 **Health Dashboard** - Overview of health metrics, risk scores, and recent scans
- 📈 **Health Logs** - Track vitals (BP, heart rate, blood sugar, weight, etc.)
- 💊 **Medication Management** - Track prescriptions and medications
- 📜 **Detection History** - View past scan results with filtering
- 👤 **Profile Management** - Update personal and medical information

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library
- **Recharts** - Data visualization (optional)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Chatbot.jsx          # AI chatbot component
│   │   ├── Layout.jsx           # Main app layout with sidebar
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── ProtectedRoute.jsx   # Route guard for authentication
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context provider
│   ├── pages/
│   │   ├── LandingPage.jsx      # Marketing landing page
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── OnboardingFlow.jsx   # Multi-step profile creation
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── DetectionPage.jsx    # CT scan upload and analysis
│   │   ├── DetectionHistory.jsx # Past detections
│   │   ├── Profile.jsx          # User profile
│   │   ├── HealthLogs.jsx       # Vitals tracking
│   │   └── Medications.jsx      # Medication management
│   ├── services/
│   │   └── api.js               # Axios instance and API functions
│   ├── App_New.jsx              # Main app component with routing
│   ├── App.css                  # Global styles
│   └── main.jsx                 # App entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on http://localhost:3000
- Python ML server running on http://localhost:5000

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Update the values:

```env
VITE_API_URL=http://localhost:3000/api
VITE_PYTHON_SERVER_URL=http://localhost:5000
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Usage Guide

### First Time Setup

1. **Landing Page** - Visit http://localhost:5173
2. **Register** - Click "Sign Up" and create an account
3. **Onboarding** - Complete the 4-step profile setup:
   - Personal Information
   - Medical History
   - Lifestyle Information
   - Health Goals & Concerns
4. **Dashboard** - You'll be redirected to the main dashboard

### Key Features

#### 📸 CT Scan Upload

- Navigate to "Detection" in the sidebar
- Drag & drop or browse for CT scan image
- Click "Analyze Scan" to get AI-powered results
- View confidence scores, risk level, and AI recommendations

#### 💬 AI Chatbot

- Click the floating chat button (bottom-right)
- Ask health-related questions
- Get context-aware responses based on your profile and medical history
- View chat history

#### 📊 Health Dashboard

- View overall health statistics
- See recent scans and health logs
- Check your BMI and risk score
- Access quick actions

#### 📈 Health Logs

- Click "Health Logs" in the sidebar
- Add new vitals (BP, heart rate, blood sugar, weight, etc.)
- View historical data with color-coded status indicators

#### 💊 Medications

- Navigate to "Medications"
- Add prescriptions with dosage, frequency, and instructions
- Track active and completed medications
- Set reminders (future feature)

#### 👤 Profile Management

- Click "Profile" in the sidebar
- View and edit personal information
- Upload profile picture
- Review medical history

## API Integration

The frontend connects to the backend via the API service layer (`services/api.js`):

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Profile

- `POST /profile` - Create profile
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `POST /profile/picture` - Upload profile picture

### Medical History

- `POST /profile/medical-history` - Create medical history
- `GET /profile/medical-history` - Get medical history
- `PUT /profile/medical-history` - Update medical history

### Detection

- `POST /detection/upload` - Upload CT scan
- `GET /detection/history` - Get detection history
- `GET /detection/:id` - Get detection details

### Chat

- `POST /chat/message` - Send message to AI
- `GET /chat/history` - Get chat history
- `DELETE /chat/history` - Clear chat history

### Health Logs

- `POST /health-log` - Create health log
- `GET /health-log` - Get health logs
- `DELETE /health-log/:id` - Delete health log

### Medications

- `POST /medication` - Create medication
- `GET /medication` - Get medications
- `PUT /medication/:id` - Update medication
- `DELETE /medication/:id` - Delete medication

### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/recent-detections` - Get recent detections
- `GET /dashboard/health-trends` - Get health trends

## Authentication Flow

1. User registers/logs in
2. JWT token is stored in localStorage
3. Token is automatically attached to all API requests via Axios interceptor
4. Protected routes check for valid token
5. On 401 response, user is redirected to login

## Styling

The app uses **Tailwind CSS** for styling:

- Utility-first approach
- Responsive design with mobile-first breakpoints
- Custom color scheme (blue/purple gradient theme)
- Consistent spacing and typography

### Color Scheme

- **Primary**: Blue (#2563EB)
- **Secondary**: Purple (#9333EA)
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#EAB308)
- **Error**: Red (#EF4444)

## Components

### AuthContext

Manages authentication state:

- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `hasProfile` - Boolean profile completion status
- `login(email, password)` - Login function
- `register(email, password)` - Registration function
- `logout()` - Logout function

### ProtectedRoute

Guards routes that require authentication:

- Checks if user is authenticated
- Optionally checks if profile is complete (`requireProfile` prop)
- Redirects to login or onboarding if conditions not met

### Layout

Main app layout:

- Top navigation bar with logo and logout button
- Sidebar with navigation links
- Outlet for nested routes

### Chatbot

Floating AI assistant:

- Opens as a modal from bottom-right
- Displays chat history
- Sends messages to backend
- Shows typing indicator
- Suggested questions for new users

## Troubleshooting

### API Connection Issues

- Ensure backend is running on http://localhost:3000
- Check VITE_API_URL in .env file
- Verify CORS is enabled on backend

### Authentication Errors

- Clear localStorage and try logging in again
- Check JWT token expiration in backend
- Verify token format in API requests

### Build Errors

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `npm run dev -- --force`

### Styling Issues

- Make sure Tailwind CSS is properly configured
- Check if `@tailwindcss/vite` plugin is loaded
- Restart dev server after config changes

## Future Enhancements

- [ ] Real-time notifications for medication reminders
- [ ] Data visualization with charts (Recharts integration)
- [ ] Export health reports as PDF
- [ ] Dark mode support
- [ ] Progressive Web App (PWA) capabilities
- [ ] Multi-language support
- [ ] Integration with wearable devices
- [ ] Telemedicine video consultations
- [ ] Family health linking and sharing

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the HealthAI platform.

## Support

For issues or questions, please contact the development team.
