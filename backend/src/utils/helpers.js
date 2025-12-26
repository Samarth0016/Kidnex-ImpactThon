import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - Match result
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate BMI
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} - BMI value
 */
export const calculateBMI = (weight, height) => {
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  // BMI = weight (kg) / height² (m²)
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(2));
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} - Age in years
 */
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate health risk score
 * @param {object} userData - User data including profile, medical history, detections
 * @returns {number} - Risk score (0-100)
 */
export const calculateRiskScore = (userData) => {
  let score = 0;

  // BMI factor (0-20 points)
  if (userData.profile?.bmi) {
    const bmi = userData.profile.bmi;
    if (bmi < 18.5 || bmi > 30) score += 20;
    else if (bmi > 25) score += 10;
  }

  // Age factor (0-15 points)
  if (userData.profile?.age) {
    const age = userData.profile.age;
    if (age > 60) score += 15;
    else if (age > 45) score += 10;
    else if (age > 30) score += 5;
  }

  // Medical history factors (0-30 points)
  if (userData.medicalHistory) {
    const conditions = [
      'diabetes',
      'hypertension',
      'heartCondition',
      'thyroid',
    ];
    conditions.forEach(condition => {
      if (userData.medicalHistory[condition]) score += 7.5;
    });
  }

  // Lifestyle factors (0-20 points)
  if (userData.medicalHistory) {
    if (userData.medicalHistory.smoking) score += 10;
    if (userData.medicalHistory.alcohol) score += 5;
    if (userData.medicalHistory.activityLevel === 'SEDENTARY') score += 5;
  }

  // Recent detections (0-15 points)
  if (userData.recentDetections && userData.recentDetections.length > 0) {
    const abnormalDetections = userData.recentDetections.filter(
      d => d.prediction !== 'Normal' && d.confidence > 0.7
    );
    score += Math.min(abnormalDetections.length * 5, 15);
  }

  return Math.min(Math.round(score), 100);
};

/**
 * Determine risk level from score
 * @param {number} score - Risk score (0-100)
 * @returns {string} - Risk level
 */
export const getRiskLevel = (score) => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export default {
  hashPassword,
  comparePassword,
  generateRandomToken,
  calculateBMI,
  calculateAge,
  calculateRiskScore,
  getRiskLevel,
  formatDate,
  sanitizeInput,
};
