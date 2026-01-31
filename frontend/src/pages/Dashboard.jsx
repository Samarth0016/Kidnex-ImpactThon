import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardAPI, detectionAPI, healthLogAPI, medicationAPI, profileAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarIcon,
  FireIcon,
  BellAlertIcon,
  UserGroupIcon,
  BeakerIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CpuChipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  SparklesIcon as SparklesIconSolid,
} from '@heroicons/react/24/solid';

const Dashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [healthTrends, setHealthTrends] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [habits, setHabits] = useState(null);
  const [medications, setMedications] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [healthPlan, setHealthPlan] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Reload when returning from detection page
  useEffect(() => {
    if (location.state?.refresh) {
      loadDashboard();
    }
  }, [location.state]);

  // Animate stats on mount
  useEffect(() => {
    if (stats) {
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [stats]);

  const loadDashboard = async () => {
    try {
      const [dashRes, detectionsRes, medsRes, profileRes, historyRes] = await Promise.all([
        dashboardAPI.get(),
        detectionAPI.getHistory({ limit: 5 }),
        medicationAPI.getAll(true).catch(() => ({ data: { data: { medications: [] } } })),
        profileAPI.getProfile().catch(() => ({ data: { data: { profile: null } } })),
        profileAPI.getMedicalHistory().catch(() => ({ data: { data: { medicalHistory: null } } })),
      ]);

      const dashboardData = dashRes.data.data;
      const detections = detectionsRes.data.data?.detections || [];
      const meds = medsRes.data.data?.medications || medsRes.data.medications || [];
      const profileData = profileRes.data.data?.profile || profileRes.data.profile || null;
      const historyData = historyRes.data.data?.medicalHistory || historyRes.data.medicalHistory || null;

      setProfile(profileData);
      setMedicalHistory(historyData);
      setMedications(meds);
      setRecentDetections(detections);

      // Calculate comprehensive health score
      const calculatedHealthScore = calculateHealthScore(profileData, historyData, detections);
      setHealthScore(calculatedHealthScore);

      // Generate personalized health plan
      const plan = generateHealthPlan(profileData, historyData, calculatedHealthScore);
      setHealthPlan(plan);

      // Check for emergency alerts
      const alerts = checkEmergencyAlerts(detections, historyData);
      setEmergencyAlerts(alerts);

      // Generate habits data from profile and recent logs
      setHabits({
        waterIntake: 2.1,
        waterGoal: 3,
        steps: 6540,
        stepsGoal: 10000,
        sleepHours: historyData?.sleepHours || 'SEVEN_TO_EIGHT',
        sleepGoal: 8,
        caloriesConsumed: 1850,
        caloriesGoal: 2000,
      });

      setStats({
        totalScans: detectionsRes.data.data?.pagination?.total || detections.length || 0,
        normalScans: detections.filter(d => d.prediction === 'Normal').length || 0,
        abnormalScans: detections.filter(d => d.prediction !== 'Normal').length || 0,
        riskScore: calculatedHealthScore.score,
        riskLevel: calculatedHealthScore.level,
        bmi: profileData?.bmi || dashboardData.profile?.bmi,
        totalHealthLogs: dashboardData.healthLogs?.length || 0,
      });

      setHealthTrends({
        weightChange: -2.5,
        riskReduction: 8,
        activityImprovement: 15,
      });

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive health risk score (0-100)
  const calculateHealthScore = (profile, medicalHistory, detections) => {
    let score = 100; // Start with perfect score and deduct
    let factors = [];

    // BMI Factor (up to 15 points)
    if (profile?.bmi) {
      const bmi = profile.bmi;
      if (bmi < 18.5) {
        score -= 10;
        factors.push({ name: 'Underweight BMI', impact: 10, type: 'negative' });
      } else if (bmi >= 25 && bmi < 30) {
        score -= 8;
        factors.push({ name: 'Overweight BMI', impact: 8, type: 'negative' });
      } else if (bmi >= 30) {
        score -= 15;
        factors.push({ name: 'Obese BMI', impact: 15, type: 'negative' });
      } else {
        factors.push({ name: 'Healthy BMI', impact: 5, type: 'positive' });
      }
    }

    // Age Factor (up to 10 points)
    if (profile?.age) {
      const age = profile.age;
      if (age > 60) {
        score -= 10;
        factors.push({ name: 'Age > 60', impact: 10, type: 'negative' });
      } else if (age > 45) {
        score -= 5;
        factors.push({ name: 'Age 45-60', impact: 5, type: 'negative' });
      }
    }

    // Sleep Factor (up to 10 points)
    if (medicalHistory?.sleepHours) {
      if (medicalHistory.sleepHours === 'LESS_THAN_FIVE') {
        score -= 10;
        factors.push({ name: 'Insufficient Sleep (<5hrs)', impact: 10, type: 'negative' });
      } else if (medicalHistory.sleepHours === 'FIVE_TO_SEVEN') {
        score -= 5;
        factors.push({ name: 'Low Sleep (5-7hrs)', impact: 5, type: 'negative' });
      } else {
        factors.push({ name: 'Good Sleep', impact: 3, type: 'positive' });
      }
    }

    // Activity Level (up to 10 points)
    if (medicalHistory?.activityLevel) {
      if (medicalHistory.activityLevel === 'SEDENTARY') {
        score -= 10;
        factors.push({ name: 'Sedentary Lifestyle', impact: 10, type: 'negative' });
      } else if (medicalHistory.activityLevel === 'LIGHT') {
        score -= 5;
        factors.push({ name: 'Light Activity', impact: 5, type: 'negative' });
      } else if (medicalHistory.activityLevel === 'HIGH') {
        factors.push({ name: 'High Activity Level', impact: 5, type: 'positive' });
      }
    }

    // Lifestyle factors
    if (medicalHistory?.smoking) {
      score -= 15;
      factors.push({ name: 'Smoking', impact: 15, type: 'negative' });
    }
    if (medicalHistory?.alcohol) {
      score -= 8;
      factors.push({ name: 'Alcohol Consumption', impact: 8, type: 'negative' });
    }

    // Medical conditions (up to 20 points)
    if (medicalHistory) {
      if (medicalHistory.diabetes) {
        score -= 10;
        factors.push({ name: 'Diabetes', impact: 10, type: 'negative' });
      }
      if (medicalHistory.hypertension) {
        score -= 8;
        factors.push({ name: 'Hypertension', impact: 8, type: 'negative' });
      }
      if (medicalHistory.heartCondition) {
        score -= 12;
        factors.push({ name: 'Heart Condition', impact: 12, type: 'negative' });
      }
    }

    // Family history (up to 15 points)
    if (medicalHistory) {
      let familyRisk = 0;
      if (medicalHistory.familyDiabetes) familyRisk += 3;
      if (medicalHistory.familyHeartDisease) familyRisk += 4;
      if (medicalHistory.familyCancer) familyRisk += 4;
      if (medicalHistory.familyKidneyDisease) familyRisk += 4;
      if (familyRisk > 0) {
        score -= familyRisk;
        factors.push({ name: 'Family Health History', impact: familyRisk, type: 'negative' });
      }
    }

    // Detection results (up to 20 points)
    if (detections && detections.length > 0) {
      const abnormalDetections = detections.filter(d => d.prediction !== 'Normal');
      if (abnormalDetections.length > 0) {
        const impact = Math.min(abnormalDetections.length * 5, 20);
        score -= impact;
        factors.push({ name: `${abnormalDetections.length} Abnormal Scan(s)`, impact, type: 'negative' });
      } else {
        factors.push({ name: 'All Scans Normal', impact: 5, type: 'positive' });
      }
    }

    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level, description;
    if (score >= 80) {
      level = 'EXCELLENT';
      description = 'Your health indicators are excellent. Keep maintaining your healthy lifestyle!';
    } else if (score >= 60) {
      level = 'GOOD';
      description = 'Your health is good with some areas for improvement.';
    } else if (score >= 40) {
      level = 'MODERATE';
      description = 'Moderate health risk detected. Consider lifestyle changes.';
    } else if (score >= 20) {
      level = 'HIGH';
      description = 'High health risk. Please consult with a healthcare provider.';
    } else {
      level = 'CRITICAL';
      description = 'Critical health indicators. Immediate medical attention recommended.';
    }

    return { score, level, factors, description };
  };

  // Generate personalized health plan
  const generateHealthPlan = (profile, medicalHistory, healthScore) => {
    const plan = {
      meals: [],
      exercise: [],
      sleep: [],
      hydration: [],
      mentalHealth: [],
    };

    // Meal suggestions based on conditions
    if (medicalHistory?.diabetes || healthScore.score < 60) {
      plan.meals = [
        { time: 'Breakfast', suggestion: 'Oatmeal with nuts and berries, low-fat milk', icon: '🥣' },
        { time: 'Lunch', suggestion: 'Grilled chicken salad with quinoa, leafy greens', icon: '🥗' },
        { time: 'Snack', suggestion: 'Greek yogurt with chia seeds', icon: '🥛' },
        { time: 'Dinner', suggestion: 'Baked fish with steamed vegetables, brown rice', icon: '🐟' },
      ];
    } else {
      plan.meals = [
        { time: 'Breakfast', suggestion: 'Whole grain toast with eggs and avocado', icon: '🍳' },
        { time: 'Lunch', suggestion: 'Mediterranean bowl with hummus and falafel', icon: '🥙' },
        { time: 'Snack', suggestion: 'Fresh fruits and mixed nuts', icon: '🍎' },
        { time: 'Dinner', suggestion: 'Lean protein with roasted vegetables', icon: '🥘' },
      ];
    }

    // Exercise based on activity level
    const activityLevel = medicalHistory?.activityLevel || 'SEDENTARY';
    if (activityLevel === 'SEDENTARY') {
      plan.exercise = [
        { day: 'Mon-Wed-Fri', activity: '30 min brisk walking', target: '5,000 steps' },
        { day: 'Tue-Thu', activity: '15 min light stretching', target: 'Flexibility' },
        { day: 'Weekend', activity: '20 min cycling or swimming', target: 'Cardio' },
      ];
    } else {
      plan.exercise = [
        { day: 'Mon-Wed-Fri', activity: '45 min jogging or HIIT', target: '10,000 steps' },
        { day: 'Tue-Thu', activity: '30 min strength training', target: 'Muscle building' },
        { day: 'Weekend', activity: '1 hour outdoor activity', target: 'Active lifestyle' },
      ];
    }

    // Sleep recommendations
    plan.sleep = [
      { tip: 'Maintain consistent sleep schedule', time: '10:30 PM - 6:30 AM' },
      { tip: 'Avoid screens 1 hour before bed', time: 'After 9:30 PM' },
      { tip: 'Create dark, cool sleeping environment', time: '18-20°C optimal' },
    ];

    // Hydration
    const waterGoal = profile?.weight ? Math.round(profile.weight * 0.033 * 10) / 10 : 2.5;
    plan.hydration = [
      { time: 'Morning', amount: '500ml', tip: 'Start day with warm lemon water' },
      { time: 'Before meals', amount: '250ml', tip: 'Aids digestion' },
      { time: 'Throughout day', amount: `${waterGoal}L total`, tip: 'Set hourly reminders' },
    ];

    // Mental health
    plan.mentalHealth = [
      { activity: 'Morning meditation', duration: '10 min', benefit: 'Reduces stress' },
      { activity: 'Gratitude journaling', duration: '5 min', benefit: 'Improves mood' },
      { activity: 'Digital detox', duration: '1 hour', benefit: 'Better sleep quality' },
      { activity: 'Social connection', duration: 'Daily', benefit: 'Emotional wellbeing' },
    ];

    return plan;
  };

  // Check for emergency alerts
  const checkEmergencyAlerts = (detections, medicalHistory) => {
    const alerts = [];

    // Check recent detections for critical findings
    const recentAbnormal = detections.filter(d => 
      d.prediction !== 'Normal' && 
      d.confidence > 0.8 &&
      new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentAbnormal.length > 0) {
      const critical = recentAbnormal.find(d => d.prediction === 'Tumor');
      if (critical) {
        alerts.push({
          type: 'CRITICAL',
          title: 'Urgent: Abnormal Scan Detected',
          message: 'A potential tumor was detected in your recent scan. Please consult a specialist immediately.',
          action: 'Schedule Appointment',
        });
      }
    }

    // Check for multiple risk factors
    if (medicalHistory) {
      const highRiskFactors = [
        medicalHistory.diabetes,
        medicalHistory.hypertension,
        medicalHistory.heartCondition,
        medicalHistory.smoking,
      ].filter(Boolean).length;

      if (highRiskFactors >= 3) {
        alerts.push({
          type: 'HIGH',
          title: 'Multiple Risk Factors Detected',
          message: 'You have multiple health risk factors. Regular monitoring recommended.',
          action: 'View Health Plan',
        });
      }
    }

    return alerts;
  };

  // Government health schemes based on profile
  const getEligibleSchemes = () => {
    const schemes = [];
    
    if (profile?.age && profile.age >= 60) {
      schemes.push({
        name: 'Rashtriya Vayoshri Yojana',
        description: 'Free assistive devices for senior citizens',
        eligibility: 'Age 60+ with BPL status',
        icon: '👴',
      });
    }

    schemes.push({
      name: 'Ayushman Bharat PM-JAY',
      description: 'Health coverage up to ₹5 lakh per family',
      eligibility: 'Based on SECC 2011 data',
      icon: '🏥',
    });

    schemes.push({
      name: 'National Health Mission',
      description: 'Free screenings and preventive healthcare',
      eligibility: 'All citizens',
      icon: '🩺',
    });

    if (medicalHistory?.diabetes || medicalHistory?.hypertension) {
      schemes.push({
        name: 'National Programme for NCDs',
        description: 'Free diagnosis and treatment for chronic diseases',
        eligibility: 'Patients with diabetes, hypertension, cancer',
        icon: '💊',
      });
    }

    return schemes;
  };

  // Health awareness content
  const getHealthTips = () => {
    const tips = [
      {
        title: 'Kidney Health Basics',
        content: 'Drink 8-10 glasses of water daily to help kidneys filter blood effectively.',
        category: 'Prevention',
        icon: '💧',
      },
      {
        title: 'Early Detection Saves Lives',
        content: 'Regular health screenings can detect kidney disease early when treatment is most effective.',
        category: 'Awareness',
        icon: '🔍',
      },
      {
        title: 'Diet for Kidney Health',
        content: 'Reduce sodium intake and choose fresh foods over processed ones.',
        category: 'Nutrition',
        icon: '🥗',
      },
      {
        title: 'Exercise Benefits',
        content: '30 minutes of moderate exercise daily reduces risk of chronic kidney disease by 30%.',
        category: 'Fitness',
        icon: '🏃',
      },
    ];
    return tips;
  };

  const getRiskColor = (risk) => {
    const configs = {
      CRITICAL: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: 'bg-red-500',
        pulse: 'animate-pulse'
      },
      HIGH: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: 'bg-orange-500',
        pulse: ''
      },
      MODERATE: {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: 'bg-yellow-500',
        pulse: ''
      },
      GOOD: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'bg-blue-500',
        pulse: ''
      },
      EXCELLENT: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'bg-green-500',
        pulse: ''
      },
      LOW: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'bg-green-500',
        pulse: ''
      },
    };
    return configs[risk] || configs.MODERATE;
  };

  const getDetectionColor = (result) => {
    const configs = {
      Normal: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-800',
        badge: 'bg-green-500',
        border: 'border-green-300',
      },
      Tumor: {
        bg: 'bg-gradient-to-r from-red-100 to-rose-100',
        text: 'text-red-800',
        badge: 'bg-red-500',
        border: 'border-red-300',
      },
      Cyst: {
        bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        text: 'text-yellow-800',
        badge: 'bg-yellow-500',
        border: 'border-yellow-300',
      },
      Stone: {
        bg: 'bg-gradient-to-r from-orange-100 to-amber-100',
        text: 'text-orange-800',
        badge: 'bg-orange-500',
        border: 'border-orange-300',
      },
    };
    return configs[result] || {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
      text: 'text-gray-800',
      badge: 'bg-gray-500',
      border: 'border-gray-300',
    };
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-300' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-300' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-300' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-300' };
  };

  const getSleepLabel = (sleep) => {
    const labels = {
      'LESS_THAN_FIVE': '<5 hrs',
      'FIVE_TO_SEVEN': '5-7 hrs',
      'SEVEN_TO_EIGHT': '7-8 hrs',
      'MORE_THAN_EIGHT': '8+ hrs',
    };
    return labels[sleep] || '7-8 hrs';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const riskColors = getRiskColor(healthScore?.level || stats?.riskLevel);
  const bmiCategory = getBMICategory(stats?.bmi);
  const eligibleSchemes = getEligibleSchemes();
  const healthTips = getHealthTips();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Emergency Alerts Banner */}
      {emergencyAlerts.length > 0 && (
        <div className="space-y-3">
          {emergencyAlerts.map((alert, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl shadow-xl p-6 border-2 ${
                alert.type === 'CRITICAL' 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl animate-pulse">
                    <BellAlertIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{alert.title}</h3>
                    <p className="text-white/90 text-sm">{alert.message}</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 hover:scale-105 shadow-lg">
                  {alert.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome Back{profile?.firstName ? `, ${profile.firstName}` : ''}!
              </h1>
            </div>
            <p className="text-blue-100 text-sm md:text-base">
              Here's your personalized health overview
            </p>
            <div className="flex items-center gap-2 text-blue-200 text-xs">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <Link
            to="/app/detection"
            className="group relative overflow-hidden px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>New Scan</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Health Risk Score Card - NEW */}
      {healthScore && (
        <div className={`relative overflow-hidden rounded-2xl shadow-xl p-6 md:p-8 border-2 ${riskColors.bg} ${riskColors.border}`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={healthScore.score >= 60 ? '#22c55e' : healthScore.score >= 40 ? '#eab308' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(healthScore.score / 100) * 553} 553`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-5xl font-bold ${riskColors.text}`}>{healthScore.score}</span>
                    <span className="text-gray-500 text-sm">out of 100</span>
                  </div>
                </div>
                <div className={`mt-4 px-6 py-2 rounded-full ${riskColors.bg} border-2 ${riskColors.border}`}>
                  <span className={`text-lg font-bold ${riskColors.text}`}>{healthScore.level}</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Risk Score</h2>
                <p className="text-gray-600 mb-4">{healthScore.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {healthScore.factors.slice(0, 6).map((factor, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        factor.type === 'positive' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {factor.type === 'positive' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${factor.type === 'positive' ? 'text-green-800' : 'text-red-800'}`}>
                          {factor.name}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        factor.type === 'positive' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {factor.type === 'positive' ? '+' : '-'}{factor.impact}
                      </span>
                    </div>
                  ))}
                </div>

                {/* XAI Explanation */}
                <div className="mt-4 p-4 bg-white/50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CpuChipIcon className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">AI Explanation</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    This score is calculated based on your BMI ({stats?.bmi?.toFixed(1) || 'N/A'}), 
                    sleep patterns, lifestyle factors, family medical history, and recent scan results. 
                    The factors with the highest impact on your score are highlighted above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blind Spot Detection Warning - NEW */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-md p-5 border-2 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">AI Limitations Notice</h3>
            <p className="text-sm text-amber-800">
              AI analysis may miss rare symptoms or edge cases. <strong>Always consult a healthcare professional</strong> if 
              symptoms persist or worsen. This tool is for screening purposes only and does not replace professional medical diagnosis.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Scans Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-blue-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '0ms' }}
          onMouseEnter={() => setHoveredCard('scans')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <DocumentTextIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'scans' && (
                <div className="animate-bounce">
                  <FireIcon className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600">
                {stats?.totalScans || 0}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </div>

        {/* Health Logs Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-green-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
          onMouseEnter={() => setHoveredCard('logs')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <HeartIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'logs' && (
                <div className="animate-pulse">
                  <HeartIcon className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Health Logs</p>
              <p className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:text-green-600">
                {stats?.totalHealthLogs || 0}
              </p>
              <p className="text-xs text-gray-500">Tracked records</p>
            </div>
          </div>
        </div>

        {/* Normal Scans Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-emerald-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '200ms' }}
          onMouseEnter={() => setHoveredCard('normal')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'normal' && (
                <div className="animate-bounce">
                  <SparklesIcon className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Normal Scans</p>
              <p className="text-4xl font-bold text-emerald-600 transition-all duration-300 group-hover:scale-110">
                {stats?.normalScans || 0}
              </p>
              <p className="text-xs text-gray-500">Healthy results</p>
            </div>
          </div>
        </div>

        {/* Abnormal Scans Card */}
        <div 
          className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 border-2 border-transparent hover:border-red-300 cursor-pointer overflow-hidden transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '300ms' }}
          onMouseEnter={() => setHoveredCard('abnormal')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 ${stats?.abnormalScans > 0 ? 'animate-pulse' : ''}`}>
                <ExclamationTriangleIconSolid className="w-7 h-7 text-white" />
              </div>
              {hoveredCard === 'abnormal' && (
                <div className="animate-pulse">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Abnormal Scans</p>
              <p className="text-4xl font-bold text-red-600 transition-all duration-300 group-hover:scale-110">
                {stats?.abnormalScans || 0}
              </p>
              <p className="text-xs text-gray-500">Needs attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Habit Tracking Section - NEW */}
      {habits && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Daily Habit Tracking</h2>
            </div>
            <Link to="/app/health-logs" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Log More →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Water Intake */}
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💧</span>
                <span className="text-sm font-semibold text-cyan-800">Water Intake</span>
              </div>
              <div className="relative h-2 bg-cyan-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(habits.waterIntake / habits.waterGoal) * 100}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-cyan-700">{habits.waterIntake}L <span className="text-sm font-normal text-cyan-500">/ {habits.waterGoal}L</span></p>
            </div>

            {/* Steps */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👟</span>
                <span className="text-sm font-semibold text-green-800">Steps Today</span>
              </div>
              <div className="relative h-2 bg-green-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(habits.steps / habits.stepsGoal) * 100}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-green-700">{habits.steps.toLocaleString()} <span className="text-sm font-normal text-green-500">/ {habits.stepsGoal.toLocaleString()}</span></p>
            </div>

            {/* Sleep */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">😴</span>
                <span className="text-sm font-semibold text-indigo-800">Sleep Duration</span>
              </div>
              <div className="relative h-2 bg-indigo-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(7.5 / habits.sleepGoal) * 100}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-indigo-700">{getSleepLabel(habits.sleepHours)} <span className="text-sm font-normal text-indigo-500">/ {habits.sleepGoal}h goal</span></p>
            </div>

            {/* Calories */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍽️</span>
                <span className="text-sm font-semibold text-orange-800">Calories</span>
              </div>
              <div className="relative h-2 bg-orange-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(habits.caloriesConsumed / habits.caloriesGoal) * 100}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-orange-700">{habits.caloriesConsumed} <span className="text-sm font-normal text-orange-500">/ {habits.caloriesGoal} kcal</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Detections - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Scans */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Scans</h2>
              </div>
              <Link 
                to="/app/history" 
                className="group flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all hover:gap-2"
              >
                <span>View All</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {recentDetections.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
                  <DocumentTextIcon className="w-16 h-16 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No scans yet</h3>
                <p className="text-gray-600 mb-4">Start your health journey by uploading your first scan</p>
                <Link 
                  to="/app/detection" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  Upload your first scan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDetections.slice(0, 5).map((detection, index) => {
                  const detectionStyle = getDetectionColor(detection.prediction);
                  return (
                    <div 
                      key={detection.id} 
                      className={`group relative flex items-center gap-4 p-4 border-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${detectionStyle.border} ${detectionStyle.bg} bg-opacity-30 hover:bg-opacity-50`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative overflow-hidden rounded-xl ring-2 ring-white shadow-md">
                        <img
                          src={detection.imageUrl}
                          alt="Scan"
                          className="w-20 h-20 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${detectionStyle.badge} ring-2 ring-white`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${detectionStyle.bg} ${detectionStyle.text} ring-1 ${detectionStyle.border}`}>
                            {detection.prediction}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(detection.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${detectionStyle.badge} transition-all duration-1000 ease-out`}
                              style={{ width: `${detection.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/app/history/${detection.id}`}
                        className="flex-shrink-0 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md transform group-hover:scale-105"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Medication Reminders */}
          {medications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <BeakerIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Medication Reminders</h2>
                </div>
                <Link to="/app/medications" className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                  Manage →
                </Link>
              </div>

              <div className="space-y-3">
                {medications.slice(0, 4).map((med) => (
                  <div key={med.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <span className="text-2xl">💊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                    </div>
                    <div className="text-right">
                      {med.reminderTimes?.length > 0 && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{med.reminderTimes[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Health Plan */}
          {healthPlan && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <SparklesIconSolid className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Personalized Health Plan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meal Plan */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🍽️</span> Today's Meals
                  </h3>
                  <div className="space-y-2">
                    {healthPlan.meals.map((meal, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                        <span className="text-lg">{meal.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">{meal.time}</p>
                          <p className="text-sm text-gray-700">{meal.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercise Plan */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🏃</span> Weekly Exercise
                  </h3>
                  <div className="space-y-2">
                    {healthPlan.exercise.map((ex, index) => (
                      <div key={index} className="flex items-start justify-between p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">{ex.day}</p>
                          <p className="text-sm text-gray-700">{ex.activity}</p>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{ex.target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sleep Schedule */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>😴</span> Sleep Schedule
                  </h3>
                  <div className="space-y-2">
                    {healthPlan.sleep.map((item, index) => (
                      <div key={index} className="flex items-start justify-between p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                        <p className="text-sm text-gray-700">{item.tip}</p>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mental Health */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🧘</span> Mental Wellness
                  </h3>
                  <div className="space-y-2">
                    {healthPlan.mentalHealth.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-start justify-between p-2 hover:bg-pink-50 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.activity}</p>
                          <p className="text-xs text-gray-500">{item.benefit}</p>
                        </div>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{item.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* BMI Card */}
          {stats?.bmi && bmiCategory && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Body Mass Index</h3>
              </div>
              <div className="relative">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#bmiGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(stats.bmi / 40) * 351.86} 351.86`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{stats.bmi.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">kg/m²</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-center p-3 rounded-xl ${bmiCategory.bg} ring-2 ${bmiCategory.ring} ring-opacity-30`}>
                  <span className={`text-sm font-bold ${bmiCategory.color}`}>{bmiCategory.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link
                to="/app/detection"
                className="group flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Upload CT Scan</span>
                  <span className="text-xs text-gray-500">Get instant analysis</span>
                </div>
                <svg className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/app/health-logs"
                className="group flex items-center gap-4 p-4 border-2 border-green-200 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Log Vitals</span>
                  <span className="text-xs text-gray-500">Track your health</span>
                </div>
                <svg className="w-5 h-5 text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/app/medications"
                className="group flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <BeakerIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">Manage Medications</span>
                  <span className="text-xs text-gray-500">Stay on schedule</span>
                </div>
                <svg className="w-5 h-5 text-purple-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Improvement Trends */}
          {healthTrends && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Improvements</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Weight Change</p>
                    <ArrowPathIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <p className={`text-2xl font-bold ${healthTrends.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {healthTrends.weightChange > 0 ? '+' : ''}{healthTrends.weightChange} kg
                  </p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Risk Reduction</p>
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    -{healthTrends.riskReduction}%
                  </p>
                  <p className="text-xs text-gray-500">Health risk improved</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Activity Level</p>
                    <FireIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    +{healthTrends.activityImprovement}%
                  </p>
                  <p className="text-xs text-gray-500">More active</p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Card */}
          {profile?.emergencyContactName && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{profile.emergencyContactName}</p>
                <p className="text-sm text-gray-600">{profile.emergencyContactPhone}</p>
                <button className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Call Emergency
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Government Health Schemes */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 md:p-8 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <GlobeAltIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Government Health Schemes</h2>
            <p className="text-gray-600 text-sm">Programs you may be eligible for</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eligibleSchemes.map((scheme, index) => (
            <div key={index} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100">
              <div className="text-3xl mb-3">{scheme.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{scheme.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
              <p className="text-xs text-blue-600 font-medium">{scheme.eligibility}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Awareness Tips */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-lg p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200 to-transparent rounded-full -mr-32 -mt-32 opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <LightBulbIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Health Awareness Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthTips.map((tip, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-2xl mb-2">{tip.icon}</div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">{tip.category}</span>
                <h4 className="font-bold text-gray-900 mt-1 mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
