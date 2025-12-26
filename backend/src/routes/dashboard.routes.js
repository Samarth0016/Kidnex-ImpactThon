import express from 'express';
import { getDashboard, getHealthRiskScore, getTrendAnalytics } from '../controllers/dashboard.controller.js';
import { protect, requireProfile } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireProfile);

router.get('/', getDashboard);
router.get('/risk-score', getHealthRiskScore);
router.get('/trends', getTrendAnalytics);

export default router;
