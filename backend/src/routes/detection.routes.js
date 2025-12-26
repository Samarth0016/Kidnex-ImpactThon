import express from 'express';
import {
  uploadForDetection,
  getDetectionHistory,
  getDetectionById,
  getPreviousImages,
  updateDetectionNotes,
} from '../controllers/detection.controller.js';
import { protect, requireProfile } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Detection routes
router.post('/upload', requireProfile, uploadImage, uploadForDetection);
router.get('/history', getDetectionHistory);
router.get('/previous-images', getPreviousImages);
router.get('/:id', getDetectionById);
router.put('/:id/notes', updateDetectionNotes);

export default router;
