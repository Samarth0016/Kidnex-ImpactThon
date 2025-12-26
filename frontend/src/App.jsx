import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import DetectionPage from './pages/DetectionPage';
import DetectionHistory from './pages/DetectionHistory';
import Profile from './pages/Profile';
import HealthLogs from './pages/HealthLogs';
import Medications from './pages/Medications';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/app"
          element={
            <ProtectedRoute requireProfile>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="detection" element={<DetectionPage />} />
          <Route path="history" element={<DetectionHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="health-logs" element={<HealthLogs />} />
          <Route path="medications" element={<Medications />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Chatbot - accessible from protected routes */}
      <Chatbot />
    </>
  );
}

export default App;
