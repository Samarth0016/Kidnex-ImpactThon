import { useState, useEffect } from 'react';
import { healthLogAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, HeartIcon, ScaleIcon, BoltIcon } from '@heroicons/react/24/outline';

const HealthLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    bloodSugar: '',
    weight: '',
    temperature: '',
    oxygenSaturation: '',
    notes: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await healthLogAPI.getLogs();
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to load health logs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string values to numbers, filter out empty values
      const dataToSubmit = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] && formData[key] !== '') {
          if (key === 'notes') {
            dataToSubmit[key] = formData[key];
          } else {
            dataToSubmit[key] = parseFloat(formData[key]);
          }
        }
      });

      await healthLogAPI.createLog(dataToSubmit);
      toast.success('Health log saved successfully');
      setShowForm(false);
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        bloodSugar: '',
        weight: '',
        temperature: '',
        oxygenSaturation: '',
        notes: '',
      });
      await loadLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save health log');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;

    try {
      await healthLogAPI.deleteLog(id);
      toast.success('Health log deleted');
      await loadLogs();
    } catch (error) {
      toast.error('Failed to delete health log');
    }
  };

  const getStatusColor = (metric, value) => {
    if (metric === 'bloodPressure') {
      const [systolic, diastolic] = value.split('/').map(Number);
      if (systolic >= 140 || diastolic >= 90) return 'text-red-600';
      if (systolic >= 120 || diastolic >= 80) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (metric === 'heartRate') {
      if (value < 60 || value > 100) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (metric === 'bloodSugar') {
      if (value < 70 || value > 140) return 'text-red-600';
      if (value > 100) return 'text-yellow-600';
      return 'text-green-600';
    }
    return 'text-gray-900';
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Logs</h1>
          <p className="text-gray-600 mt-2">Track your vitals and health metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Log
        </button>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New Health Log</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (Systolic)
                </label>
                <input
                  name="bloodPressureSystolic"
                  type="number"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                  placeholder="120"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (Diastolic)
                </label>
                <input
                  name="bloodPressureDiastolic"
                  type="number"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                  placeholder="80"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  name="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  name="bloodSugar"
                  type="number"
                  value={formData.bloodSugar}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="37.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygen Saturation (%)
                </label>
                <input
                  name="oxygenSaturation"
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional observations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Log'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <HeartIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No health logs yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Add your first log
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(log.logDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(log.logDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {log.bloodPressureSystolic && log.bloodPressureDiastolic && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Blood Pressure</p>
                    <p
                      className={`text-lg font-bold ${getStatusColor(
                        'bloodPressure',
                        `${log.bloodPressureSystolic}/${log.bloodPressureDiastolic}`
                      )}`}
                    >
                      {log.bloodPressureSystolic}/{log.bloodPressureDiastolic}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                )}
                {log.heartRate && (
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Heart Rate</p>
                    <p className={`text-lg font-bold ${getStatusColor('heartRate', log.heartRate)}`}>
                      {log.heartRate}
                    </p>
                    <p className="text-xs text-gray-500">bpm</p>
                  </div>
                )}
                {log.bloodSugar && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Blood Sugar</p>
                    <p className={`text-lg font-bold ${getStatusColor('bloodSugar', log.bloodSugar)}`}>
                      {log.bloodSugar}
                    </p>
                    <p className="text-xs text-gray-500">mg/dL</p>
                  </div>
                )}
                {log.weight && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                    <p className="text-lg font-bold text-gray-900">{log.weight}</p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                )}
                {log.temperature && (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Temperature</p>
                    <p className="text-lg font-bold text-gray-900">{log.temperature}</p>
                    <p className="text-xs text-gray-500">°C</p>
                  </div>
                )}
                {log.oxygenSaturation && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">O₂ Saturation</p>
                    <p className="text-lg font-bold text-gray-900">{log.oxygenSaturation}</p>
                    <p className="text-xs text-gray-500">%</p>
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-900">{log.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthLogs;
