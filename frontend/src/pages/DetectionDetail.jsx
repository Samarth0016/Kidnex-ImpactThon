import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { detectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

const DetectionDetail = () => {
  const { id } = useParams();
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetection();
  }, [id]);

  const loadDetection = async () => {
    try {
      const response = await detectionAPI.getById(id);
      setDetection(response.data.data?.detection || null);
    } catch (error) {
      console.error('Failed to load detection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result) => {
    const configs = {
      Normal: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        text: 'text-green-800',
        border: 'border-green-300',
        badge: 'bg-green-500',
        ring: 'ring-green-300',
        cardBg: 'bg-gradient-to-r from-green-100 to-emerald-100',
      },
      Tumor: {
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        text: 'text-red-800',
        border: 'border-red-300',
        badge: 'bg-red-500',
        ring: 'ring-red-300',
        cardBg: 'bg-gradient-to-r from-red-100 to-rose-100',
      },
      Cyst: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
        ring: 'ring-yellow-300',
        cardBg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
      },
      Stone: {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        text: 'text-orange-800',
        border: 'border-orange-300',
        badge: 'bg-orange-500',
        ring: 'ring-orange-300',
        cardBg: 'bg-gradient-to-r from-orange-100 to-amber-100',
      },
    };
    return configs[result] || {
      bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
      text: 'text-gray-800',
      border: 'border-gray-300',
      badge: 'bg-gray-500',
      ring: 'ring-gray-300',
      cardBg: 'bg-gradient-to-r from-gray-100 to-slate-100',
    };
  };

  const getRiskColor = (risk) => {
    const configs = {
      CRITICAL: {
        text: 'text-red-700',
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-300',
        badge: 'bg-red-600',
        ring: 'ring-red-300',
        pulse: 'animate-pulse',
      },
      HIGH: {
        text: 'text-orange-700',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-300',
        badge: 'bg-orange-600',
        ring: 'ring-orange-300',
        pulse: '',
      },
      MODERATE: {
        text: 'text-yellow-700',
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-300',
        badge: 'bg-yellow-600',
        ring: 'ring-yellow-300',
        pulse: '',
      },
      LOW: {
        text: 'text-green-700',
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-300',
        badge: 'bg-green-600',
        ring: 'ring-green-300',
        pulse: '',
      },
    };
    return configs[risk] || configs.LOW;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!detection) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-full mb-6">
            <ExclamationTriangleIcon className="w-20 h-20 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Detection Not Found</h2>
          <p className="text-gray-600 mb-6">The scan you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/app/history" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const resultStyle = getResultColor(detection.prediction);
  const riskStyle = detection.riskLevel ? getRiskColor(detection.riskLevel) : null;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/app/history"
        className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-gray-200"
      >
        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">Back to History</span>
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50">
            <img
              src={detection.imageUrl}
              alt="CT Scan"
              className="w-full h-[500px] object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className={`p-4 border-t-4 ${resultStyle.border}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Scan Date</span>
              <div className="flex items-center gap-2 text-gray-900">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-semibold">
                  {new Date(detection.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Result Card */}
          <div className={`rounded-2xl shadow-lg p-6 border-2 ${resultStyle.border} ${resultStyle.bg}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${resultStyle.badge} rounded-xl shadow-md`}>
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Analysis Result</h1>
              </div>
              <span className={`px-5 py-2 rounded-full text-lg font-bold ${resultStyle.cardBg} ${resultStyle.text} ring-2 ${resultStyle.ring} ring-opacity-50 shadow-md`}>
                {detection.prediction}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-sm font-medium text-gray-600 mb-1">Confidence Level</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {(detection.confidence * 100).toFixed(1)}%
                </p>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${resultStyle.badge} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${detection.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {riskStyle && (
                <div className={`${riskStyle.bg} backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 border-2 ${riskStyle.border}`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">Risk Assessment</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${riskStyle.badge} text-white shadow-md ${riskStyle.pulse}`}>
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {detection.riskLevel}
                  </span>
                </div>
              )}
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-sm font-medium text-gray-600 mb-1">Scan Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(detection.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-sm font-medium text-gray-600 mb-1">Model Version</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detection.modelVersion || 'v1.0'}
                </p>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          {detection.probabilities && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Detailed Probabilities</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(detection.probabilities).map(([className, prob]) => {
                  const isActive = className === detection.prediction;
                  return (
                    <div key={className} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isActive && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                          <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                            {className}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${isActive ? 'text-indigo-600' : 'text-gray-900'}`}>
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(prob * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {detection.aiSuggestions && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-transparent rounded-full -mr-32 -mt-32 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200 to-transparent rounded-full -ml-24 -mb-24 opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <SparklesIconSolid className="w-7 h-7 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI Health Recommendations</h2>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="prose prose-lg max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-gray-700 prose-li:mb-3 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-ul:space-y-2 prose-ul:my-4
                prose-ol:space-y-2 prose-ol:my-4
                marker:text-purple-600">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl flex items-center gap-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl flex items-center gap-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg flex items-center gap-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="space-y-3 my-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="space-y-3 my-4" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-transparent p-3 rounded-lg hover:from-purple-100 transition-colors duration-200" {...props}>
                        <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                        <span className="flex-1">{props.children}</span>
                      </li>
                    ),
                    p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-purple-900" {...props} />,
                  }}
                >
                  {detection.aiSuggestions}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionDetail;
