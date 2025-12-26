import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { detectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
    switch (result) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Tumor':
        return 'bg-red-100 text-red-800';
      case 'Cyst':
        return 'bg-yellow-100 text-yellow-800';
      case 'Stone':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!detection) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500 text-lg">Detection not found</p>
        <Link to="/app/history" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/app/history"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to History
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <img
            src={detection.imageUrl}
            alt="CT Scan"
            className="w-full h-96 object-contain bg-gray-100"
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Analysis Result</h1>
              <span
                className={`px-4 py-2 rounded-full text-lg font-bold ${getResultColor(
                  detection.prediction
                )}`}
              >
                {detection.prediction}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(detection.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className="text-2xl font-bold">
                  <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(detection.riskLevel)}`}>
                    {detection.riskLevel || 'N/A'}
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(detection.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Model Version</p>
                <p className="text-lg font-semibold text-gray-900">
                  {detection.modelVersion || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          {detection.probabilities && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Class Probabilities</h2>
              <div className="space-y-3">
                {Object.entries(detection.probabilities).map(([className, prob]) => (
                  <div key={className} className="flex items-center">
                    <span className="w-20 text-sm font-medium text-gray-700">{className}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                      <div
                        className={`h-4 rounded-full ${
                          className === detection.prediction ? 'bg-blue-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(prob * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm font-semibold text-gray-900 text-right">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {detection.aiSuggestions && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Health Recommendations</h2>
          <div className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{detection.aiSuggestions}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionDetail;
