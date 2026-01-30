import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import detectionRoutes from './src/routes/detection.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import healthLogRoutes from './src/routes/healthLog.routes.js';
import medicationRoutes from './src/routes/medication.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import reportSimplifierRoutes from './src/routes/reportSimplifier.routes.js';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { notFound } from './src/middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Health Platform Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report-simplifier', reportSimplifierRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Health Platform Backend`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(`🐍 Python ML Server: ${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

export default app;
