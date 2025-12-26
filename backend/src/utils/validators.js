import { body, validationResult } from 'express-validator';

/**
 * Validation middleware to check for validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ==================== AUTH VALIDATIONS ====================

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// ==================== PROFILE VALIDATIONS ====================

export const profileValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('gender')
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('height')
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  validate,
];

// ==================== MEDICAL HISTORY VALIDATIONS ====================

export const medicalHistoryValidation = [
  body('sleepHours')
    .optional()
    .isIn(['LESS_THAN_FIVE', 'FIVE_TO_SEVEN', 'SEVEN_TO_EIGHT', 'MORE_THAN_EIGHT'])
    .withMessage('Invalid sleep duration'),
  body('activityLevel')
    .optional()
    .isIn(['SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH'])
    .withMessage('Invalid activity level'),
  validate,
];

// ==================== HEALTH LOG VALIDATIONS ====================

export const healthLogValidation = [
  body('bloodPressureSystolic')
    .optional()
    .isInt({ min: 60, max: 250 })
    .withMessage('Systolic BP must be between 60 and 250'),
  body('bloodPressureDiastolic')
    .optional()
    .isInt({ min: 40, max: 150 })
    .withMessage('Diastolic BP must be between 40 and 150'),
  body('heartRate')
    .optional()
    .isInt({ min: 30, max: 220 })
    .withMessage('Heart rate must be between 30 and 220 bpm'),
  body('bloodSugar')
    .optional()
    .isFloat({ min: 20, max: 600 })
    .withMessage('Blood sugar must be between 20 and 600 mg/dL'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  validate,
];

// ==================== MEDICATION VALIDATIONS ====================

export const medicationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  body('frequency')
    .trim()
    .notEmpty()
    .withMessage('Frequency is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  validate,
];

// ==================== CHAT VALIDATIONS ====================

export const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  validate,
];

export default {
  validate,
  registerValidation,
  loginValidation,
  profileValidation,
  medicalHistoryValidation,
  healthLogValidation,
  medicationValidation,
  chatValidation,
};
