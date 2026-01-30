import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadMedicalReport } from '../middleware/upload.js';
import {
  simplifyReport,
  getReportHistory,
  getReportById,
  deleteReport,
} from '../controllers/reportSimplifier.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/report-simplifier/upload
 * @desc    Upload and simplify a medical report (image or PDF)
 * @access  Private
 */
router.post('/upload', uploadMedicalReport, simplifyReport);

/**
 * @route   GET /api/report-simplifier/history
 * @desc    Get user's simplified report history
 * @access  Private
 */
router.get('/history', getReportHistory);

/**
 * @route   GET /api/report-simplifier/:id
 * @desc    Get a specific simplified report
 * @access  Private
 */
router.get('/:id', getReportById);

/**
 * @route   DELETE /api/report-simplifier/:id
 * @desc    Delete a simplified report
 * @access  Private
 */
router.delete('/:id', deleteReport);

export default router;
