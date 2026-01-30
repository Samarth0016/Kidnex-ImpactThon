import axios from 'axios';
import prisma from '../config/database.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { generateHealthSuggestions } from '../config/gemini.js';
import { generateNvidiaHealthSuggestions, isNvidiaConfigured } from '../config/nvidia.js';
import { getRiskLevel } from '../utils/helpers.js';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5000';

/**
 * @desc    Upload image for disease detection
 * @route   POST /api/detection/upload
 * @access  Private
 */
export const uploadForDetection = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image provided',
        message: 'Please upload an image file',
      });
    }

    const userId = req.user.id;
    const { detectionType = 'KIDNEY_DISEASE', aiModel = 'gemini' } = req.body;

    console.log('📸 Image received for detection:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      detectionType,
    });

    // Step 1: Upload to Cloudinary (for storage and medical history)
    console.log('☁️ Uploading to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      `health-platform/detections/${detectionType.toLowerCase()}`,
      `${userId}_${Date.now()}`
    );

    // Step 2: Convert image buffer to base64 for Python server
    const base64Image = req.file.buffer.toString('base64');

    // Step 3: Send to Python ML server for prediction
    console.log('🔄 Sending to Python ML server...');
    const pythonResponse = await axios.post(
      `${PYTHON_SERVER_URL}/predict`,
      {
        image: base64Image,
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Prediction received from Python server');

    const prediction = pythonResponse.data;

    // Step 4: Get user profile for personalized suggestions
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            medicalHistory: true,
          },
        },
      },
    });

    // Step 5: Calculate risk level based on prediction
    let riskLevel = 'LOW';
    let riskScore = 0;

    if (prediction.prediction === 'Tumor') {
      riskLevel = 'CRITICAL';
      riskScore = 85 + (prediction.confidence * 15);
    } else if (prediction.prediction === 'Stone') {
      riskLevel = 'HIGH';
      riskScore = 60 + (prediction.confidence * 20);
    } else if (prediction.prediction === 'Cyst') {
      riskLevel = 'MODERATE';
      riskScore = 35 + (prediction.confidence * 25);
    } else {
      riskLevel = 'LOW';
      riskScore = 10 + ((1 - prediction.confidence) * 15);
    }

    // Step 6: Generate AI-powered health suggestions
    console.log(`🤖 Generating AI health suggestions using ${aiModel}...`);
    const detectionData = {
      detectionType,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      riskLevel,
    };

    const profileData = {
      age: userProfile.age,
      gender: userProfile.gender,
      bmi: userProfile.bmi,
      medicalHistory: userProfile.user.medicalHistory,
    };

    let aiSuggestions = null;
    try {
      if (aiModel === 'nvidia' && isNvidiaConfigured()) {
        aiSuggestions = await generateNvidiaHealthSuggestions(detectionData, profileData);
      } else {
        aiSuggestions = await generateHealthSuggestions(detectionData, profileData);
      }
    } catch (error) {
      console.error(`${aiModel} API Error:`, error);
      // Continue without AI suggestions
    }

    // Step 7: Save detection result to database
    const detectionHistory = await prisma.detectionHistory.create({
      data: {
        userId,
        detectionType,
        imageUrl: cloudinaryResult.secure_url,
        imagePublicId: cloudinaryResult.public_id,
        originalFilename: req.file.originalname,
        imageSize: req.file.size,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        modelVersion: prediction.model || 'Random_Search_fold4',
        aiSuggestions,
        riskLevel,
        riskScore,
        status: 'PENDING_REVIEW',
      },
    });

    console.log('✅ Detection saved to database');

    res.status(200).json({
      success: true,
      message: 'Image processed successfully',
      data: {
        detection: detectionHistory,
        modelPrediction: {
          prediction: prediction.prediction,
          confidence: prediction.confidence,
          probabilities: prediction.probabilities,
        },
      },
    });
  } catch (error) {
    console.error('❌ Detection error:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Python server unavailable',
        message: 'Cannot connect to ML server. Please try again later.',
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Prediction failed',
        message: error.response.data.message || error.response.data.error,
      });
    }

    next(error);
  }
};

/**
 * @desc    Get detection history
 * @route   GET /api/detection/history
 * @access  Private
 */
export const getDetectionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { detectionType, limit = 20, offset = 0 } = req.query;

    const where = { userId };
    if (detectionType) {
      where.detectionType = detectionType;
    }

    const [detections, total] = await Promise.all([
      prisma.detectionHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.detectionHistory.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        detections,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detection by ID
 * @route   GET /api/detection/:id
 * @access  Private
 */
export const getDetectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const detection = await prisma.detectionHistory.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Detection not found',
        message: 'The requested detection record was not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { detection },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get previous images for detection type
 * @route   GET /api/detection/previous-images
 * @access  Private
 */
export const getPreviousImages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { detectionType = 'KIDNEY_DISEASE' } = req.query;

    const images = await prisma.detectionHistory.findMany({
      where: {
        userId,
        detectionType,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        imageUrl: true,
        prediction: true,
        confidence: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update detection notes
 * @route   PUT /api/detection/:id/notes
 * @access  Private
 */
export const updateDetectionNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { userNotes } = req.body;

    // Verify ownership
    const detection = await prisma.detectionHistory.findFirst({
      where: { id, userId },
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Detection not found',
        message: 'The requested detection record was not found',
      });
    }

    // Update notes
    const updated = await prisma.detectionHistory.update({
      where: { id },
      data: { userNotes },
    });

    res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      data: { detection: updated },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadForDetection,
  getDetectionHistory,
  getDetectionById,
  getPreviousImages,
  updateDetectionNotes,
};
