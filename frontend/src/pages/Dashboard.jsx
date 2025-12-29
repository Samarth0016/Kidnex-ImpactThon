import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardAPI, detectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from '@heroicons/react/24/solid';

const Dashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [healthTrends, setHealthTrends] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Reload when returning from detection page
  useEffect(() => {
    if (location.state?.refresh) {
      loadDashboard();
    }
  }, [location.state]);

  // Animate stats on mount
  useEffect(() => {
    if (stats) {
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [stats]);

  const loadDashboard = async () => {
    try {
      const [dashRes, detectionsRes] = await Promise.all([
        dashboardAPI.get(),
        detectionAPI.getHistory({ limit: 5 }),
      ]);

      console.log('Dashboard response:', dashRes.data);
      console.log('Recent detections:', detectionsRes.data);

      const dashboardData = dashRes.data.data;
      setStats({
        totalScans: detectionsRes.data.data?.pagination?.total || 0,
        normalScans: detectionsRes.data.data?.detections?.filter(d => d.prediction === 'Normal').length || 0,
        abnormalScans: detectionsRes.data.data?.detections?.filter(d => d.prediction !== 'Normal').length || 0,
        riskScore: dashboardData.riskAssessment?.riskScore || 0,
        riskLevel: dashboardData.riskAssessment?.riskLevel || 'LOW',
        bmi: dashboardData.profile?.bmi,
      });
      
      setRecentDetections(detectionsRes.data.data?.detections || []);
      setHealthTrends(null); // Will be implemented later
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: 'bg-red-500',
          pulse: 'animate-pulse'
        };
      case 'MODERATE':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: 'bg-yellow-500',
          pulse: ''
        };
      case 'LOW':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: 'bg-green-500',
          pulse: ''
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: 'bg-gray-500',
          pulse: ''
        };
    }
  };

  const getDetectionColor = (result) => {
    const configs = {
      Normal: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-800',
        badge: 'bg-green-500',
        border: 'border-green-300',
      },
      Tumor: {
        bg: 'bg-gradient-to-r from-red-100 to-rose-100',
        text: 'text-red-800',
        badge: 'bg-red-500',
        border: 'border-red-300',
      },
      Cyst: {
        bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        text: 'text-yellow-800',
        badge: 'bg-yellow-500',
        border: 'border-yellow-300',
      },
      Stone: {
        bg: 'bg-gradient-to-r from-orange-100 to-amber-100',
        text: 'text-orange-800',
        badge: 'bg-orange-500',
        border: 'border-orange-300',
      },
    };
    return configs[result] || {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
      text: 'text-gray-800',
      badge: 'bg-gray-500',
      border: 'border-gray-300',
    };
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-300' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-300' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-300' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-300' };
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const riskColors = getRiskColor(stats?.riskLevel);
  const bmiCategory = getBMICategory(stats?.bmi);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome Back!
              </h1>
            </div>
            <p className="text-blue-100 text-sm md:text-base">
              Here's your personalized health overview
            </p>
            <div className="flex items-center gap-2 text-blue-200 text-xs">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <Link
            to="/app/detection"
            className="group relative overflow-hidden px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>New Scan</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Scans Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-blue-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '0ms' }}
          onMouseEnter={() => setHoveredCard('scans')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <DocumentTextIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'scans' && (
                <div className="animate-bounce">
                  <FireIcon className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600">
                {stats?.totalScans || 0}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </div>

        {/* Health Logs Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-green-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
          onMouseEnter={() => setHoveredCard('logs')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <HeartIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'logs' && (
                <div className="animate-pulse">
                  <HeartIcon className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Health Logs</p>
              <p className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:text-green-600">
                {stats?.totalHealthLogs || 0}
              </p>
              <p className="text-xs text-gray-500">Tracked records</p>
            </div>
          </div>
        </div>

        {/* Normal Scans Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-emerald-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '200ms' }}
          onMouseEnter={() => setHoveredCard('normal')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'normal' && (
                <div className="animate-bounce">
                  <SparklesIcon className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Normal Scans</p>
              <p className="text-4xl font-bold text-emerald-600 transition-all duration-300 group-hover:scale-110">
                {stats?.normalScans || 0}
              </p>
              <p className="text-xs text-gray-500">Healthy results</p>
            </div>
          </div>
        </div>

        {/* Risk Level Card */}
        <div 
          className={`group relative rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${riskColors.bg} ${riskColors.border}`}
          style={{ transitionDelay: '300ms' }}
          onMouseEnter={() => setHoveredCard('risk')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${riskColors.icon} rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 ${riskColors.pulse}`}>
                <ExclamationTriangleIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'risk' && (
                <div className="animate-pulse">
                  <ExclamationTriangleIcon className={`w-5 h-5 ${riskColors.text}`} />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-medium ${riskColors.text}`}>Risk Level</p>
              <p className={`text-2xl font-bold ${riskColors.text} transition-all duration-300 group-hover:scale-110`}>
                {stats?.riskLevel || 'LOW'}
              </p>
              <p className={`text-xs ${riskColors.text} opacity-75`}>Current status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Detections - 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Scans</h2>
            </div>
            <Link 
              to="/app/history" 
              className="group flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all hover:gap-2"
            >
              <span>View All</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentDetections.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
                <DocumentTextIcon className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No scans yet</h3>
              <p className="text-gray-600 mb-4">Start your health journey by uploading your first scan</p>
              <Link 
                to="/app/detection" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                Upload your first scan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDetections.slice(0, 5).map((detection, index) => {
                const detectionStyle = getDetectionColor(detection.prediction);
                return (
                  <div 
                    key={detection.id} 
                    className={`group relative flex items-center gap-4 p-4 border-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${detectionStyle.border} ${detectionStyle.bg} bg-opacity-30 hover:bg-opacity-50`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative overflow-hidden rounded-xl ring-2 ring-white shadow-md">
                      <img
                        src={detection.imageUrl}
                        alt="Scan"
                        className="w-20 h-20 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${detectionStyle.badge} ring-2 ring-white`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${detectionStyle.bg} ${detectionStyle.text} ring-1 ${detectionStyle.border}`}>
                          {detection.prediction}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(detection.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${detectionStyle.badge} transition-all duration-1000 ease-out`}
                            style={{ width: `${detection.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/app/history/${detection.id}`}
                      className="flex-shrink-0 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md transform group-hover:scale-105"
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Health Insights */}
        <div className="space-y-6">
          {/* BMI Card */}
          {stats?.bmi && bmiCategory && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Body Mass Index</h3>
              </div>
              <div className="relative">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#bmiGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(stats.bmi / 40) * 351.86} 351.86`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{stats.bmi.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">kg/m²</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-center p-3 rounded-xl ${bmiCategory.bg} ring-2 ${bmiCategory.ring} ring-opacity-30`}>
                  <span className={`text-sm font-bold ${bmiCategory.color}`}>{bmiCategory.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link
                to="/app/detection"
                className="group flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Upload CT Scan</span>
                  <span className="text-xs text-gray-500">Get instant analysis</span>
                </div>
                <svg className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/app/health-logs"
                className="group flex items-center gap-4 p-4 border-2 border-green-200 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Log Vitals</span>
                  <span className="text-xs text-gray-500">Track your health</span>
                </div>
                <svg className="w-5 h-5 text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/app/medications"
                className="group flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Manage Medications</span>
                  <span className="text-xs text-gray-500">Stay on schedule</span>
                </div>
                <svg className="w-5 h-5 text-purple-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Health Trends */}
          {healthTrends && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Health Trends</h3>
              </div>
              <div className="space-y-4">
                {healthTrends.weightTrend && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Weight Change</p>
                    <p className={`text-2xl font-bold ${healthTrends.weightTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {healthTrends.weightTrend > 0 ? '+' : ''}{healthTrends.weightTrend} kg
                    </p>
                  </div>
                )}
                {healthTrends.bpTrend && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Blood Pressure</p>
                    <p className="text-2xl font-bold text-gray-900">{healthTrends.bpTrend}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {stats?.aiRecommendations && stats.aiRecommendations.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-transparent rounded-full -mr-32 -mt-32 opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.aiRecommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
