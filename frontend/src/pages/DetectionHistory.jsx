import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { detectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

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
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDetections = detections.filter((detection) => {
    const matchesSearch = detection.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Detection History</h1>
        <p className="text-gray-600 mt-2">View all your past CT scan analyses</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by result type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Results</option>
              <option value="Normal">Normal</option>
              <option value="Tumor">Tumor</option>
              <option value="Cyst">Cyst</option>
              <option value="Stone">Stone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredDetections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No detections found</p>
          <Link to="/app/detection" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Upload your first scan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDetections.map((detection) => (
            <Link
              key={detection.id}
              to={`/app/history/${detection.id}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden group"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={detection.imageUrl}
                  alt="CT Scan"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Result Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getResultColor(detection.prediction)}`}>
                    {detection.prediction}
                  </span>
                  {detection.riskLevel && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(detection.riskLevel)}`}>
                      {detection.riskLevel}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Confidence</p>
                    <p className="font-semibold text-gray-900">
                      {(detection.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(detection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="pt-2 border-t">
                  <span className="text-blue-600 text-sm font-semibold group-hover:text-blue-700">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {detections.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">{detections.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {detections.filter((d) => d.prediction === 'Normal').length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Abnormal</p>
              <p className="text-2xl font-bold text-red-600">
                {detections.filter((d) => d.prediction !== 'Normal').length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100
                ).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionHistory;
