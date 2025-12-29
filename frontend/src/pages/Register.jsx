import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, hasProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (hasProfile) {
        navigate('/app/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, hasProfile, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-100 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">HealthAI</span>
            </Link>
            <div className="mt-6 space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600">Join us to start your health journey</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.password ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.password}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4" />
                  8+ characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 transition-all duration-300 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-200">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <SparklesIcon className="w-5 h-5 animate-pulse" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
          <ShieldCheckIcon className="w-4 h-4 text-green-600" />
          <p>Your data is encrypted • HIPAA Compliant • Never shared</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
