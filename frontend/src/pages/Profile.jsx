import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CameraIcon, 
  PencilIcon, 
  UserCircleIcon,
  HeartIcon,
  ScaleIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  MoonIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon,
  HeartIcon as HeartIconSolid,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getMedicalHistory(),
      ]);

      // API returns { success: true, data: { profile: {...} } }
      const profileData = profileRes.data.data?.profile || profileRes.data.data || profileRes.data;
      const historyData = historyRes.data.data?.medicalHistory || historyRes.data.data || historyRes.data;

      setProfile(profileData);
      setMedicalHistory(historyData);

      // Map schema fields to form fields
      const fullName = profileData?.firstName && profileData?.lastName 
        ? `${profileData.firstName} ${profileData.lastName}` 
        : '';

      setFormData({
        fullName: fullName,
        phoneNumber: profileData?.phone || '',
        address: profileData?.address || '',
        emergencyContact: profileData?.emergencyContactName || '',
        emergencyPhone: profileData?.emergencyContactPhone || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
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
      await profileAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await profileAPI.uploadProfilePicture(file);
      toast.success('Profile picture updated');
      await loadProfile();
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
  };

  const getSleepLabel = (sleep) => {
    const labels = {
      'LESS_THAN_FIVE': 'Less than 5 hours',
      'FIVE_TO_SEVEN': '5-7 hours',
      'SEVEN_TO_EIGHT': '7-8 hours',
      'MORE_THAN_EIGHT': 'More than 8 hours',
    };
    return labels[sleep] || 'Not specified';
  };

  const getActivityLabel = (activity) => {
    const labels = {
      'SEDENTARY': 'Sedentary (Little or no exercise)',
      'LIGHT': 'Light (Exercise 1-3 times/week)',
      'MODERATE': 'Moderate (Exercise 3-5 times/week)',
      'HIGH': 'High (Exercise 6-7 times/week)',
    };
    return labels[activity] || 'Not specified';
  };

  const getActivityColor = (activity) => {
    const colors = {
      'SEDENTARY': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      'LIGHT': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      'MODERATE': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'HIGH': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[activity] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  // Get all pre-existing conditions
  const getPreExistingConditions = () => {
    if (!medicalHistory) return [];
    const conditions = [];
    if (medicalHistory.diabetes) conditions.push({ name: 'Diabetes', icon: '🩸', severity: 'high' });
    if (medicalHistory.hypertension) conditions.push({ name: 'Hypertension', icon: '💓', severity: 'high' });
    if (medicalHistory.heartCondition) conditions.push({ name: 'Heart Condition', icon: '❤️', severity: 'critical' });
    if (medicalHistory.thyroid) conditions.push({ name: 'Thyroid', icon: '🦋', severity: 'moderate' });
    if (medicalHistory.asthma) conditions.push({ name: 'Asthma', icon: '🫁', severity: 'moderate' });
    if (medicalHistory.pcos) conditions.push({ name: 'PCOS', icon: '👩', severity: 'moderate' });
    return conditions;
  };

  // Get family health history
  const getFamilyHistory = () => {
    if (!medicalHistory) return [];
    const history = [];
    if (medicalHistory.familyDiabetes) history.push({ name: 'Diabetes', icon: '🩸', risk: 'Increased risk' });
    if (medicalHistory.familyHeartDisease) history.push({ name: 'Heart Disease', icon: '❤️', risk: 'Increased risk' });
    if (medicalHistory.familyThyroid) history.push({ name: 'Thyroid', icon: '🦋', risk: 'Genetic predisposition' });
    if (medicalHistory.familyCancer) history.push({ name: 'Cancer', icon: '🎗️', risk: 'Monitor closely' });
    if (medicalHistory.familyKidneyDisease) history.push({ name: 'Kidney Disease', icon: '🫘', risk: 'Increased risk' });
    return history;
  };

  if (loading && !profile) {
    return <LoadingSpinner fullScreen />;
  }

  const bmi = profile?.bmi || calculateBMI(profile?.height, profile?.weight);
  const bmiCategory = getBMICategory(bmi);
  const preExistingConditions = getPreExistingConditions();
  const familyHistory = getFamilyHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6 mb-8 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 animate-fadeIn">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl ring-2 ring-white/20">
                <UserCircleIcon className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Your Profile
                </h1>
                <p className="text-blue-100 text-lg">Manage your personal and medical information</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 animate-fadeIn">
            {/* Profile Picture */}
            <div className="relative inline-block mb-6">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-blue-200 ring-offset-4 shadow-xl">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover"
                  />
                ) : (
                  profile?.firstName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 ring-2 ring-white">
                <CameraIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}` 
                : profile?.firstName || 'User'}
            </h2>
            <p className="text-gray-600 text-sm mb-2">{user?.email}</p>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold rounded-full mt-2">
              <CheckBadgeIcon className="w-4 h-4" />
              Verified Account
            </div>

            {/* Quick Stats */}
            <div className="mt-8 space-y-3">
              {profile?.dateOfBirth && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-900">Age</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.age || calculateAge(profile.dateOfBirth)} <span className="text-sm text-gray-600">years</span>
                  </p>
                </div>
              )}
              {bmi && bmiCategory && (
                <div className={`rounded-xl p-4 border-2 ${bmiCategory.border} ${bmiCategory.bg} hover:shadow-md transition-all duration-300`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ScaleIcon className={`w-5 h-5 ${bmiCategory.color}`} />
                    <p className={`text-sm font-semibold ${bmiCategory.color}`}>BMI</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bmi}
                  </p>
                  <p className={`text-xs font-semibold ${bmiCategory.color}`}>{bmiCategory.label}</p>
                </div>
              )}
              {medicalHistory?.bloodType && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200 hover:border-red-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BeakerIcon className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-900">Blood Type</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {medicalHistory.bloodType}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <UserCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-300"
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-red-900 mb-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Emergency Contact
                  </label>
                  <input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300"
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-pink-900 mb-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Emergency Phone
                  </label>
                  <input
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-pink-300"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircleIcon className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900">Gender</p>
                  </div>
                  <p className="font-bold text-gray-900">{profile?.gender || 'Not set'}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs font-semibold text-indigo-900">Date of Birth</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneIcon className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900">Phone</p>
                  </div>
                  <p className="font-bold text-gray-900">{profile?.phone || 'Not set'}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="w-4 h-4 text-pink-600" />
                    <p className="text-xs font-semibold text-pink-900">Address</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{profile?.address || 'Not set'}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheckIcon className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-semibold text-red-900">Emergency Contact</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.emergencyContactName || 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneIcon className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-900">Emergency Phone</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.emergencyContactPhone || 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ScaleIcon className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-900">Height</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.height ? `${profile.height} cm` : 'Not set'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ScaleIcon className="w-4 h-4 text-teal-600" />
                    <p className="text-xs font-semibold text-teal-900">Weight</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {profile?.weight ? `${profile.weight} kg` : 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medical History - Comprehensive View */}
          {medicalHistory && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100 hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Medical History</h3>
              </div>

              {/* Pre-existing Conditions */}
              {preExistingConditions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                    Pre-existing Conditions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {preExistingConditions.map((condition, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                          condition.severity === 'critical' 
                            ? 'bg-red-50 border-red-300' 
                            : condition.severity === 'high'
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-yellow-50 border-yellow-300'
                        }`}
                      >
                        <span className="text-2xl">{condition.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{condition.name}</p>
                          <p className={`text-xs font-medium ${
                            condition.severity === 'critical' 
                              ? 'text-red-600' 
                              : condition.severity === 'high'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}>
                            {condition.severity === 'critical' ? 'Critical' : condition.severity === 'high' ? 'High Priority' : 'Monitor'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {medicalHistory.allergies && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 shadow-md">
                  <div className="flex items-start gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-yellow-900">⚠️ Allergies</p>
                  </div>
                  <p className="text-gray-900 leading-relaxed ml-7">{medicalHistory.allergies}</p>
                </div>
              )}

              {/* Lifestyle Factors */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  Lifestyle Factors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sleep Duration */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <MoonIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-indigo-900">Sleep Duration</p>
                        <p className="font-bold text-gray-900">{getSleepLabel(medicalHistory.sleepHours)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className={`p-4 rounded-xl border ${getActivityColor(medicalHistory.activityLevel).bg} ${getActivityColor(medicalHistory.activityLevel).border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(medicalHistory.activityLevel).bg}`}>
                        <BoltIcon className={`w-5 h-5 ${getActivityColor(medicalHistory.activityLevel).text}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${getActivityColor(medicalHistory.activityLevel).text}`}>Activity Level</p>
                        <p className="font-bold text-gray-900">{getActivityLabel(medicalHistory.activityLevel)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Smoking */}
                  <div className={`p-4 rounded-xl border ${medicalHistory.smoking ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${medicalHistory.smoking ? 'bg-red-100' : 'bg-green-100'}`}>
                        <FireIcon className={`w-5 h-5 ${medicalHistory.smoking ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${medicalHistory.smoking ? 'text-red-900' : 'text-green-900'}`}>Smoking</p>
                        <p className="font-bold text-gray-900">{medicalHistory.smoking ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Alcohol */}
                  <div className={`p-4 rounded-xl border ${medicalHistory.alcohol ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${medicalHistory.alcohol ? 'bg-orange-100' : 'bg-green-100'}`}>
                        <BeakerIcon className={`w-5 h-5 ${medicalHistory.alcohol ? 'text-orange-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${medicalHistory.alcohol ? 'text-orange-900' : 'text-green-900'}`}>Alcohol</p>
                        <p className="font-bold text-gray-900">{medicalHistory.alcohol ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Health History */}
              {familyHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-blue-500" />
                    Family Health History
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-blue-700 mb-3">⚠️ These conditions in your family may increase your risk. Regular screenings recommended.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {familyHistory.map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-blue-600">{item.risk}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {medicalHistory.familyOther && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700"><strong>Other:</strong> {medicalHistory.familyOther}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Current Symptoms */}
              {medicalHistory.symptoms && medicalHistory.symptoms.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                  <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                    Current Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-300"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Medical Information */}
              {medicalHistory.other && (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-900 mb-2">Additional Medical Notes</p>
                  <p className="text-gray-700 leading-relaxed">{medicalHistory.other}</p>
                </div>
              )}

              {/* Health Goals */}
              {profile?.healthGoal && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-2 mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-green-900">Health Goal</p>
                  </div>
                  <div className="inline-flex px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold ring-2 ring-green-300 ring-opacity-30">
                    {profile.healthGoal.replace(/_/g, ' ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Medical History Message */}
          {!medicalHistory && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Medical History</h3>
              <p className="text-gray-600 mb-4">Complete your medical history to get personalized health insights.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg">
                Add Medical History
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
