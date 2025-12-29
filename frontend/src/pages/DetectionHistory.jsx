import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { detectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';

const DetectionHistory = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDetections();
  }, [filter]);

  const loadDetections = async () => {
    try {
      const response = await detectionAPI.getHistory(filter !== 'all' ? { detectionType: filter } : {});
      console.log('Detection history response:', response.data);
      setDetections(response.data.data?.detections || []);
    } catch (error) {
      console.error('Failed to load detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result) => {
    const configs = {
      Normal: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-800',
        badge: 'bg-green-500',
        border: 'border-green-300',
        ring: 'ring-green-300',
      },
      Tumor: {
        bg: 'bg-gradient-to-r from-red-100 to-rose-100',
        text: 'text-red-800',
        badge: 'bg-red-500',
        border: 'border-red-300',
        ring: 'ring-red-300',
      },
      Cyst: {
        bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        text: 'text-yellow-800',
        badge: 'bg-yellow-500',
        border: 'border-yellow-300',
        ring: 'ring-yellow-300',
      },
      Stone: {
        bg: 'bg-gradient-to-r from-orange-100 to-amber-100',
        text: 'text-orange-800',
        badge: 'bg-orange-500',
        border: 'border-orange-300',
        ring: 'ring-orange-300',
      },
    };
    return configs[result] || {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
      text: 'text-gray-800',
      badge: 'bg-gray-500',
      border: 'border-gray-300',
      ring: 'ring-gray-300',
    };
  };

  const getRiskColor = (risk) => {
    const configs = {
      CRITICAL: {
        text: 'text-red-700',
        bg: 'bg-gradient-to-r from-red-100 to-rose-100',
        badge: 'bg-red-600',
        ring: 'ring-red-300',
      },
      HIGH: {
        text: 'text-orange-700',
        bg: 'bg-gradient-to-r from-orange-100 to-amber-100',
        badge: 'bg-orange-600',
        ring: 'ring-orange-300',
      },
      MODERATE: {
        text: 'text-yellow-700',
        bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        badge: 'bg-yellow-600',
        ring: 'ring-yellow-300',
      },
      LOW: {
        text: 'text-green-700',
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        badge: 'bg-green-600',
        ring: 'ring-green-300',
      },
    };
    return configs[risk] || configs.LOW;
  };

  const filteredDetections = detections.filter((detection) => {
    const matchesSearch = detection.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ClockIcon className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Detection History</h1>
          </div>
          <p className="text-purple-100 ml-11">Track and review all your CT scan analyses</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
            <input
              type="text"
              placeholder="Search by result type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-400"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative group">
            <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white cursor-pointer transition-all duration-300 font-medium hover:border-purple-300"
            >
              <option value="all">All Results</option>
              <option value="Normal">Normal</option>
              <option value="Tumor">Tumor</option>
              <option value="Cyst">Cyst</option>
              <option value="Stone">Stone</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredDetections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="inline-block p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full mb-4">
            <DocumentTextIcon className="w-20 h-20 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Detections Found</h3>
          <p className="text-gray-600 mb-6">Start your health journey by uploading your first scan</p>
          <Link 
            to="/app/detection" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            <SparklesIcon className="w-5 h-5" />
            Upload your first scan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDetections.map((detection, index) => {
            const resultStyle = getResultColor(detection.prediction);
            const riskStyle = detection.riskLevel ? getRiskColor(detection.riskLevel) : null;
            
            return (
              <Link
                key={detection.id}
                to={`/app/history/${detection.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative h-52 bg-gradient-to-br from-gray-50 to-slate-50 overflow-hidden">
                  <img
                    src={detection.imageUrl}
                    alt="CT Scan"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge on Image */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${resultStyle.badge} text-white shadow-lg ring-2 ring-white backdrop-blur-sm`}>
                      {detection.prediction}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-5 space-y-4 border-t-4 ${resultStyle.border}`}>
                  {/* Result and Risk Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${resultStyle.bg} ${resultStyle.text} ring-2 ${resultStyle.ring} ring-opacity-30 shadow-md`}>
                      {detection.prediction}
                    </span>
                    {riskStyle && (
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${riskStyle.badge} text-white shadow-md`}>
                        {detection.riskLevel}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${resultStyle.badge} transition-all duration-1000 ease-out`}
                            style={{ width: `${detection.confidence * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {(detection.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(detection.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* View Details Link */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-purple-600 group-hover:text-purple-700">
                      <span className="text-sm font-semibold">View Full Analysis</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {detections.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-transparent rounded-full -mr-32 -mt-32 opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Summary Statistics</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{detections.length}</p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">Normal</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {detections.filter((d) => d.prediction === 'Normal').length}
                </p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">Abnormal</p>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {detections.filter((d) => d.prediction !== 'Normal').length}
                </p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {(
                    detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100
                  ).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionHistory;
