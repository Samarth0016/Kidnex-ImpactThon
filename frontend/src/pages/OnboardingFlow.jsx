import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  HeartIcon,
  HomeIcon,
  BeakerIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { setHasProfile, reloadUser, hasProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Redirect if user already has profile
  useEffect(() => {
    if (hasProfile) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [hasProfile, navigate]);

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Medical History
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    surgeries: '',
    familyHistory: '',

    // Lifestyle
    height: '',
    weight: '',
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
    dietType: '',
    sleepHours: '',
    occupation: '',

    // Symptoms & Goals
    symptoms: '',
    concerns: '',
    healthGoals: [],
  });

  const healthGoalOptions = [
    'Weight Management',
    'Disease Prevention',
    'Fitness Improvement',
    'Mental Health',
    'Chronic Disease Management',
    'Better Sleep',
    'Nutrition Improvement',
    'Stress Reduction',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleHealthGoalToggle = (goal) => {
    setFormData({
      ...formData,
      healthGoals: formData.healthGoals.includes(goal)
        ? formData.healthGoals.filter((g) => g !== goal)
        : [...formData.healthGoals, goal],
    });
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.height || !formData.weight) {
      toast.error('Please fill in all required fields (marked with *)');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating profile with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
      });

      // Create profile
      const profileResponse = await profileAPI.createProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
      });
      
      console.log('Profile created:', profileResponse.data);

      console.log('Creating medical history with data:', {
        allergies: formData.allergies || undefined,
        sleepHours: formData.sleepHours || 'SEVEN_TO_EIGHT',
        activityLevel: formData.exerciseFrequency || 'SEDENTARY',
        smoking: formData.smokingStatus === 'current',
        alcohol: formData.alcoholConsumption !== 'none',
        symptoms: formData.symptoms ? [formData.symptoms] : [],
      });

      // Create medical history
      const medicalHistoryResponse = await profileAPI.createMedicalHistory({
        allergies: formData.allergies || undefined,
        sleepHours: formData.sleepHours || 'SEVEN_TO_EIGHT',
        activityLevel: formData.exerciseFrequency || 'SEDENTARY',
        smoking: formData.smokingStatus === 'current',
        alcohol: formData.alcoholConsumption !== 'none',
        symptoms: formData.symptoms ? [formData.symptoms] : [],
      });
      
      console.log('Medical history created:', medicalHistoryResponse.data);

      // Reload user to get updated profile data
      console.log('Reloading user data...');
      await reloadUser();
      setHasProfile(true);
      
      console.log('Onboarding completed successfully!');
      toast.success('Profile created successfully!');
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
          <UserIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">Let's start with some basic information about you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            First Name *
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
            placeholder="John"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Last Name *
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300"
            placeholder="Doe"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Date of Birth *
          </label>
          <input
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-300"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-pink-900 mb-2">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-pink-300"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Phone Number
          </label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-teal-900 mb-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            Address
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 hover:border-teal-300"
            placeholder="123 Main St, City, State"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-red-900 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Emergency Contact Name
          </label>
          <input
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-orange-900 mb-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Emergency Phone
          </label>
          <input
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mb-4">
          <HeartIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h3>
        <p className="text-gray-600">Tell us about your medical background</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-red-900 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Blood Type
          </label>
          <select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300"
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Height (cm) *
          </label>
          <input
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
            placeholder="170"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Weight (kg) *
          </label>
          <input
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300"
            placeholder="70"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-yellow-900 mb-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Allergies
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 hover:border-yellow-300"
            placeholder="List any known allergies (medications, food, environmental)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-orange-900 mb-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Chronic Conditions
          </label>
          <textarea
            name="chronicConditions"
            value={formData.chronicConditions}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
            placeholder="Diabetes, hypertension, asthma, etc."
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Current Medications
          </label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-300"
            placeholder="List medications you're currently taking"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Past Surgeries
          </label>
          <textarea
            name="surgeries"
            value={formData.surgeries}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300"
            placeholder="List any past surgeries and dates"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-pink-900 mb-2">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            Family Health History
          </label>
          <textarea
            name="familyHistory"
            value={formData.familyHistory}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-pink-300"
            placeholder="Any significant health conditions in your family"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
          <HomeIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Information</h3>
        <p className="text-gray-600">Help us understand your daily habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-red-900 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Smoking Status
          </label>
          <select
            name="smokingStatus"
            value={formData.smokingStatus}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300"
          >
            <option value="">Select Status</option>
            <option value="never">Never</option>
            <option value="former">Former Smoker</option>
            <option value="current">Current Smoker</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Alcohol Consumption
          </label>
          <select
            name="alcoholConsumption"
            value={formData.alcoholConsumption}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-300"
          >
            <option value="">Select Frequency</option>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Exercise Frequency
          </label>
          <select
            name="exerciseFrequency"
            value={formData.exerciseFrequency}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300"
          >
            <option value="">Select Activity Level</option>
            <option value="SEDENTARY">Sedentary</option>
            <option value="LIGHT">Light (1-2 days/week)</option>
            <option value="MODERATE">Moderate (3-5 days/week)</option>
            <option value="HIGH">Active (6-7 days/week)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-orange-900 mb-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Diet Type
          </label>
          <select
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
          >
            <option value="">Select Diet</option>
            <option value="balanced">Balanced</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Sleep Duration
          </label>
          <select
            name="sleepHours"
            value={formData.sleepHours}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
          >
            <option value="">Select Hours</option>
            <option value="LESS_THAN_FIVE">Less than 5 hours</option>
            <option value="FIVE_TO_SEVEN">5-7 hours</option>
            <option value="SEVEN_TO_EIGHT">7-8 hours</option>
            <option value="MORE_THAN_EIGHT">More than 8 hours</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Occupation
          </label>
          <input
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300"
            placeholder="Software Engineer"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
          <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Health Goals & Concerns</h3>
        <p className="text-gray-600">What brings you here today?</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-red-900 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Current Symptoms
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300"
            placeholder="Describe any symptoms you're experiencing (e.g., fatigue, pain, discomfort)"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-orange-900 mb-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Health Concerns
          </label>
          <textarea
            name="concerns"
            value={formData.concerns}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
            placeholder="Any specific health concerns you want to monitor or track?"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Select Your Health Goals
          </label>
          <div className="grid grid-cols-2 gap-3">
            {healthGoalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => handleHealthGoalToggle(goal)}
                className={`px-4 py-3.5 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  formData.healthGoals.includes(goal)
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-md ring-2 ring-purple-200 scale-105'
                    : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-105'
                }`}
              >
                {formData.healthGoals.includes(goal) && (
                  <CheckCircleIcon className="w-5 h-5 inline-block mr-2 text-purple-600" />
                )}
                {goal}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 bg-purple-50 px-3 py-2 rounded-lg flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-600" />
            Select one or more goals that matter most to you
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Medical History' },
    { number: 3, title: 'Lifestyle' },
    { number: 4, title: 'Goals & Concerns' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className="mt-2 text-xs text-gray-600 hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ml-auto"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          All information is confidential and encrypted
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
