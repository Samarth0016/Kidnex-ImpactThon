import { useState, useEffect } from 'react';
import { medicationAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BellIcon,
  XMarkIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { 
  BellIcon as BellIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid,
} from '@heroicons/react/24/solid';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    sideEffects: '',
    instructions: '',
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const response = await medicationAPI.getAll();
      // API returns { success: true, data: { medications: [...] } }
      setMedications(response.data.data?.medications || []);
    } catch (error) {
      toast.error('Failed to load medications');
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
      if (editingId) {
        await medicationAPI.update(editingId, formData);
        toast.success('Medication updated');
      } else {
        await medicationAPI.create(formData);
        toast.success('Medication added');
      }
      resetForm();
      await loadMedications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medication) => {
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate?.split('T')[0] || '',
      endDate: medication.endDate?.split('T')[0] || '',
      prescribedBy: medication.prescribedBy || '',
      purpose: medication.purpose || '',
      sideEffects: medication.sideEffects || '',
      instructions: medication.instructions || '',
    });
    setEditingId(medication.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    try {
      await medicationAPI.delete(id);
      toast.success('Medication deleted');
      await loadMedications();
    } catch (error) {
      toast.error('Failed to delete medication');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      purpose: '',
      sideEffects: '',
      instructions: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const isActive = (medication) => {
    if (!medication.endDate) return true;
    return new Date(medication.endDate) >= new Date();
  };

  if (loading && medications.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <BellIconSolid className="w-7 h-7 text-purple-100 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Medications</h1>
            </div>
            <p className="text-purple-100 ml-14">Manage your prescriptions and medication schedule</p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative overflow-hidden px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              {showForm ? (
                <>
                  <XMarkIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                  <span>Add Medication</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-purple-200 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Edit Medication' : 'Add New Medication'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Medication Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Aspirin"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Dosage *
                </label>
                <input
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 100mg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  Frequency *
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 cursor-pointer"
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every 4 hours">Every 4 hours</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="Every 12 hours">Every 12 hours</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Start Date *
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  End Date
                </label>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Prescribed By
                </label>
                <input
                  name="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={handleChange}
                  placeholder="Dr. John Smith"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Purpose
                </label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Pain relief, blood pressure control"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Side Effects
                </label>
                <textarea
                  name="sideEffects"
                  value={formData.sideEffects}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any known side effects..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Special instructions (take with food, avoid alcohol, etc.)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
              >
                {loading ? 'Saving...' : editingId ? 'Update Medication' : 'Add Medication'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="inline-block p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full mb-4">
            <BellIcon className="w-20 h-20 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Medications Recorded</h3>
          <p className="text-gray-600 mb-6">Start managing your medications by adding your first prescription</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Add your first medication
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medications.map((medication, index) => (
            <div
              key={medication.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 animate-fadeIn overflow-hidden ${
                isActive(medication) 
                  ? 'border-green-300 hover:border-green-400' 
                  : 'border-gray-200 opacity-75'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 pr-8">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`p-2 rounded-lg shadow-md ${
                      isActive(medication) 
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                        : 'bg-gray-100'
                    }`}>
                      <BeakerIcon className={`w-6 h-6 ${
                        isActive(medication) ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{medication.name}</h3>
                        {isActive(medication) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                            <CheckBadgeIconSolid className="w-3.5 h-3.5" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span className="font-semibold">{medication.dosage}</span>
                        <span className="text-gray-400">•</span>
                        <span>{medication.frequency}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isActive(medication) && (
                    <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold rounded-full ring-2 ring-green-300 ring-opacity-30">
                      <CheckBadgeIconSolid className="w-4 h-4" />
                      Active Treatment
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(medication)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                    title="Edit medication"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(medication.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                    title="Delete medication"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Start Date</span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(medication.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {medication.endDate && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl">
                      <ClockIcon className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">End Date</span>
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(medication.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {medication.prescribedBy && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <UserIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Prescribed By</span>
                        <span className="text-sm font-bold text-gray-900">{medication.prescribedBy}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {medication.purpose && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-purple-900">Purpose</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed ml-7">{medication.purpose}</p>
                </div>
              )}

              {medication.instructions && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-900">Instructions</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed ml-7">{medication.instructions}</p>
                </div>
              )}

              {medication.sideEffects && (
                <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 shadow-md">
                  <div className="flex items-start gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-yellow-900">Possible Side Effects</p>
                  </div>
                  <p className="text-sm text-yellow-800 leading-relaxed ml-7">{medication.sideEffects}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
