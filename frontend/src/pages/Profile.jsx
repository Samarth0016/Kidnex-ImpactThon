import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { CameraIcon, PencilIcon } from '@heroicons/react/24/outline';

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

      setProfile(profileRes.data);
      setMedicalHistory(historyRes.data);

      setFormData({
        fullName: profileRes.data.fullName || '',
        phoneNumber: profileRes.data.phoneNumber || '',
        address: profileRes.data.address || '',
        emergencyContact: profileRes.data.emergencyContact || '',
        emergencyPhone: profileRes.data.emergencyPhone || '',
      });
    } catch (error) {
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

  if (loading && !profile) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal and medical information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            {/* Profile Picture */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  profile?.fullName?.charAt(0) || 'U'
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <CameraIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{profile?.fullName}</h2>
            <p className="text-gray-600 text-sm mt-1">{user?.email}</p>

            {/* Quick Stats */}
            <div className="mt-6 space-y-3">
              {profile?.dateOfBirth && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {calculateAge(profile.dateOfBirth)} years
                  </p>
                </div>
              )}
              {medicalHistory?.height && medicalHistory?.weight && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {calculateBMI(medicalHistory.height, medicalHistory.weight)}
                  </p>
                </div>
              )}
              {medicalHistory?.bloodType && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Blood Type</p>
                  <p className="text-lg font-semibold text-gray-900">
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                  <input
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold text-gray-900">{profile?.gender || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{profile?.phoneNumber || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{profile?.address || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emergency Contact</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.emergencyContact || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emergency Phone</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.emergencyPhone || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medical History */}
          {medicalHistory && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Medical History</h3>
              <div className="space-y-4">
                {medicalHistory.allergies && (
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="text-gray-900">{medicalHistory.allergies}</p>
                  </div>
                )}
                {medicalHistory.chronicConditions && (
                  <div>
                    <p className="text-sm text-gray-600">Chronic Conditions</p>
                    <p className="text-gray-900">{medicalHistory.chronicConditions}</p>
                  </div>
                )}
                {medicalHistory.currentMedications && (
                  <div>
                    <p className="text-sm text-gray-600">Current Medications</p>
                    <p className="text-gray-900">{medicalHistory.currentMedications}</p>
                  </div>
                )}
                {medicalHistory.surgeries && (
                  <div>
                    <p className="text-sm text-gray-600">Past Surgeries</p>
                    <p className="text-gray-900">{medicalHistory.surgeries}</p>
                  </div>
                )}
                {medicalHistory.healthGoals && medicalHistory.healthGoals.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Health Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {medicalHistory.healthGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
