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
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [healthTrends, setHealthTrends] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Reload when returning from detection page
  useEffect(() => {
    if (location.state?.refresh) {
      loadDashboard();
    }
  }, [location.state]);

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
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDetectionColor = (result) => {
    if (result === 'Normal') return 'bg-green-100 text-green-800';
    if (result === 'Tumor') return 'bg-red-100 text-red-800';
    if (result === 'Cyst') return 'bg-yellow-100 text-yellow-800';
    if (result === 'Stone') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your health overview.</p>
        </div>
        <Link
          to="/app/detection"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          New Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalScans || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Health Logs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalHealthLogs || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <HeartIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Normal Scans</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.normalScans || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ChartBarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Risk Level</p>
              <p className={`text-3xl font-bold mt-1 ${
                stats?.riskLevel === 'CRITICAL' ? 'text-red-600' :
                stats?.riskLevel === 'HIGH' ? 'text-orange-600' :
                stats?.riskLevel === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats?.riskLevel || 'LOW'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              stats?.riskLevel === 'CRITICAL' ? 'bg-red-100' :
              stats?.riskLevel === 'HIGH' ? 'bg-orange-100' :
              stats?.riskLevel === 'MODERATE' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <ExclamationTriangleIcon className={`w-8 h-8 ${
                stats?.riskLevel === 'CRITICAL' ? 'text-red-600' :
                stats?.riskLevel === 'HIGH' ? 'text-orange-600' :
                stats?.riskLevel === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Detections */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
            <Link to="/app/history" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              View All
            </Link>
          </div>

          {recentDetections.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No scans yet</p>
              <Link to="/app/detection" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                Upload your first scan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDetections.slice(0, 5).map((detection) => (
                <div key={detection.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <img
                    src={detection.imageUrl}
                    alt="Scan"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDetectionColor(detection.prediction)}`}>
                        {detection.prediction}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(detection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Confidence: {(detection.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Link
                    to={`/app/history/${detection.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Insights */}
        <div className="space-y-6">
          {/* BMI Card */}
          {stats?.bmi && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">BMI</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.bmi.toFixed(1)}</div>
                <p className="text-sm text-gray-600 mt-2">Body Mass Index</p>
                <div className="mt-4">
                  {stats.bmi < 18.5 && <span className="text-yellow-600">Underweight</span>}
                  {stats.bmi >= 18.5 && stats.bmi < 25 && <span className="text-green-600">Normal</span>}
                  {stats.bmi >= 25 && stats.bmi < 30 && <span className="text-orange-600">Overweight</span>}
                  {stats.bmi >= 30 && <span className="text-red-600">Obese</span>}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/app/detection"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <PlusIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Upload CT Scan</span>
              </Link>
              <Link
                to="/app/health-logs"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition"
              >
                <HeartIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Log Vitals</span>
              </Link>
              <Link
                to="/app/medications"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition"
              >
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Manage Medications</span>
              </Link>
            </div>
          </div>

          {/* Health Trends */}
          {healthTrends && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                Health Trends
              </h3>
              <div className="space-y-3">
                {healthTrends.weightTrend && (
                  <div>
                    <p className="text-sm text-gray-600">Weight Change</p>
                    <p className={`text-lg font-semibold ${healthTrends.weightTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {healthTrends.weightTrend > 0 ? '+' : ''}{healthTrends.weightTrend} kg
                    </p>
                  </div>
                )}
                {healthTrends.bpTrend && (
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-lg font-semibold text-gray-900">{healthTrends.bpTrend}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {stats?.aiRecommendations && stats.aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.aiRecommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
