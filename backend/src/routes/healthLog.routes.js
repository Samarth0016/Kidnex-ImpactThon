import express from 'express';
import { createHealthLog, getHealthLogs, getLatestHealthLog } from '../controllers/healthLog.controller.js';
import { protect } from '../middleware/auth.js';
import { healthLogValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', healthLogValidation, createHealthLog);
router.get('/', getHealthLogs);
router.get('/latest', getLatestHealthLog);

export default router;
