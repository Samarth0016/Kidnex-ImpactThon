import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chat.controller.js';
import { protect, requireProfile } from '../middleware/auth.js';
import { chatValidation } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication and profile
router.use(protect);
router.use(requireProfile);

// Chat routes
router.post('/message', chatValidation, sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
