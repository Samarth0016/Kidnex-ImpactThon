import express from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  updateMedicalHistory,
  getMedicalHistory,
  uploadProfilePicture,
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.js';
import { profileValidation, medicalHistoryValidation } from '../utils/validators.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.post('/', profileValidation, createProfile);
router.get('/', getProfile);
router.put('/', profileValidation, updateProfile);
router.post('/picture', uploadImage, uploadProfilePicture);

// Medical history routes
router.get('/medical-history', getMedicalHistory);
router.put('/medical-history', medicalHistoryValidation, updateMedicalHistory);

export default router;
