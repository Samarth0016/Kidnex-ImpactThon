import { useState, useEffect } from 'react';
import { healthLogAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  HeartIcon, 
  ScaleIcon, 
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  SparklesIcon,
  TrashIcon,
  FireIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  FireIcon as FireIconSolid,
} from '@heroicons/react/24/solid';

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
      // API returns { success: true, data: { logs: [...] } }
      setLogs(response.data.data?.logs || []);
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
      if (systolic >= 140 || diastolic >= 90) return {
        text: 'text-red-700',
        bg: 'bg-red-100',
        badge: 'bg-red-500',
        ring: 'ring-red-300',
      };
      if (systolic >= 120 || diastolic >= 80) return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-100',
        badge: 'bg-yellow-500',
        ring: 'ring-yellow-300',
      };
      return {
        text: 'text-green-700',
        bg: 'bg-green-100',
        badge: 'bg-green-500',
        ring: 'ring-green-300',
      };
    }
    if (metric === 'heartRate') {
      if (value < 60 || value > 100) return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-100',
        badge: 'bg-yellow-500',
        ring: 'ring-yellow-300',
      };
      return {
        text: 'text-green-700',
        bg: 'bg-green-100',
        badge: 'bg-green-500',
        ring: 'ring-green-300',
      };
    }
    if (metric === 'bloodSugar') {
      if (value < 70 || value > 140) return {
        text: 'text-red-700',
        bg: 'bg-red-100',
        badge: 'bg-red-500',
        ring: 'ring-red-300',
      };
      if (value > 100) return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-100',
        badge: 'bg-yellow-500',
        ring: 'ring-yellow-300',
      };
      return {
        text: 'text-green-700',
        bg: 'bg-green-100',
        badge: 'bg-green-500',
        ring: 'ring-green-300',
      };
    }
    return {
      text: 'text-gray-900',
      bg: 'bg-gray-100',
      badge: 'bg-gray-500',
      ring: 'ring-gray-300',
    };
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-700 to-red-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <HeartIconSolid className="w-7 h-7 text-pink-100 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Health Logs</h1>
            </div>
            <p className="text-pink-100 ml-14">Track your vitals and health metrics over time</p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative overflow-hidden px-6 py-3 bg-white text-pink-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              {showForm ? (
                <>
                  <XMarkIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                  <span>Add Log</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-pink-200 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">New Health Log</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Blood Pressure (Systolic)
                </label>
                <input
                  name="bloodPressureSystolic"
                  type="number"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                  placeholder="120"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Blood Pressure (Diastolic)
                </label>
                <input
                  name="bloodPressureDiastolic"
                  type="number"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                  placeholder="80"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Heart Rate (bpm)
                </label>
                <input
                  name="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Blood Sugar (mg/dL)
                </label>
                <input
                  name="bloodSugar"
                  type="number"
                  value={formData.bloodSugar}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Weight (kg)
                </label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Temperature (°C)
                </label>
                <input
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="37.0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Oxygen Saturation (%)
                </label>
                <input
                  name="oxygenSaturation"
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional observations or symptoms..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
              >
                {loading ? 'Saving...' : 'Save Health Log'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="inline-block p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full mb-4">
            <HeartIcon className="w-20 h-20 text-pink-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Health Logs Yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your health by adding your first log entry</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Add your first log
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div 
              key={log.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-pink-200 animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                    <CalendarIcon className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(log.logDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {new Date(log.logDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(log.id)}
                  className="group/delete flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <TrashIcon className="w-4 h-4 transition-transform group-hover/delete:rotate-12" />
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {log.bloodPressureSystolic && log.bloodPressureDiastolic && (
                  <div className={`group/card relative overflow-hidden rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    getStatusColor('bloodPressure', `${log.bloodPressureSystolic}/${log.bloodPressureDiastolic}`).bg
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 ${getStatusColor('bloodPressure', `${log.bloodPressureSystolic}/${log.bloodPressureDiastolic}`).badge} rounded-lg shadow-md`}>
                          <HeartIconSolid className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Blood Pressure</p>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${
                        getStatusColor('bloodPressure', `${log.bloodPressureSystolic}/${log.bloodPressureDiastolic}`).text
                      }`}>
                        {log.bloodPressureSystolic}/{log.bloodPressureDiastolic}
                      </p>
                      <p className="text-xs font-medium text-gray-600">mmHg</p>
                    </div>
                  </div>
                )}
                
                {log.heartRate && (
                  <div className={`group/card relative overflow-hidden rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    getStatusColor('heartRate', log.heartRate).bg
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 ${getStatusColor('heartRate', log.heartRate).badge} rounded-lg shadow-md animate-pulse`}>
                          <HeartIconSolid className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Heart Rate</p>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${getStatusColor('heartRate', log.heartRate).text}`}>
                        {log.heartRate}
                      </p>
                      <p className="text-xs font-medium text-gray-600">bpm</p>
                    </div>
                  </div>
                )}
                
                {log.bloodSugar && (
                  <div className={`group/card relative overflow-hidden rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    getStatusColor('bloodSugar', log.bloodSugar).bg
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 ${getStatusColor('bloodSugar', log.bloodSugar).badge} rounded-lg shadow-md`}>
                          <BeakerIcon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Blood Sugar</p>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${getStatusColor('bloodSugar', log.bloodSugar).text}`}>
                        {log.bloodSugar}
                      </p>
                      <p className="text-xs font-medium text-gray-600">mg/dL</p>
                    </div>
                  </div>
                )}
                
                {log.weight && (
                  <div className="group/card relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-green-500 rounded-lg shadow-md">
                          <ScaleIcon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Weight</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700 mb-1">{log.weight}</p>
                      <p className="text-xs font-medium text-gray-600">kg</p>
                    </div>
                  </div>
                )}
                
                {log.temperature && (
                  <div className="group/card relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-yellow-500 rounded-lg shadow-md">
                          <FireIconSolid className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Temperature</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700 mb-1">{log.temperature}</p>
                      <p className="text-xs font-medium text-gray-600">°C</p>
                    </div>
                  </div>
                )}
                
                {log.oxygenSaturation && (
                  <div className="group/card relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-500 rounded-lg shadow-md">
                          <BoltIcon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">O₂ Saturation</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-700 mb-1">{log.oxygenSaturation}</p>
                      <p className="text-xs font-medium text-gray-600">%</p>
                    </div>
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Additional Notes</p>
                      <p className="text-gray-900 leading-relaxed bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg">
                        {log.notes}
                      </p>
                    </div>
                  </div>
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
