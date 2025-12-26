import prisma from '../config/database.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { calculateBMI, calculateAge } from '../utils/helpers.js';

/**
 * @desc    Create user profile
 * @route   POST /api/profile
 * @access  Private
 */
export const createProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Profile already exists',
        message: 'Please use PUT /api/profile to update your profile',
      });
    }

    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      height,
      weight,
      phone,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      healthGoal,
    } = req.body;

    // Calculate BMI and age
    const bmi = calculateBMI(weight, height);
    const age = calculateAge(dateOfBirth);

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        age,
        height,
        weight,
        bmi,
        phone,
        address,
        city,
        state,
        pincode,
        emergencyContactName,
        emergencyContactPhone,
        healthGoal,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Please create your profile first',
      });
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      height,
      weight,
      phone,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      healthGoal,
    } = req.body;

    // Calculate BMI and age if height/weight/DOB updated
    const updateData = {
      firstName,
      lastName,
      gender,
      phone,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      healthGoal,
    };

    if (height && weight) {
      updateData.height = height;
      updateData.weight = weight;
      updateData.bmi = calculateBMI(weight, height);
    }

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
      updateData.age = calculateAge(dateOfBirth);
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/profile/picture
 * @access  Private
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please upload an image',
      });
    }

    const userId = req.user.id;

    // Get existing profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'Please create your profile first',
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (profile.profilePicture) {
      const publicId = profile.profilePicture.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'health-platform/profiles',
      `profile_${userId}`
    );

    // Update profile with new picture URL
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { profilePicture: result.secure_url },
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: updatedProfile.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medical history
 * @route   GET /api/profile/medical-history
 * @access  Private
 */
export const getMedicalHistory = async (req, res, next) => {
  try {
    const medicalHistory = await prisma.medicalHistory.findUnique({
      where: { userId: req.user.id },
    });

    if (!medicalHistory) {
      return res.status(404).json({
        success: false,
        error: 'Medical history not found',
        message: 'Please create your medical history first',
      });
    }

    res.status(200).json({
      success: true,
      data: { medicalHistory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medical history
 * @route   PUT /api/profile/medical-history
 * @access  Private
 */
export const updateMedicalHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    // Try to update, if not exists create
    const medicalHistory = await prisma.medicalHistory.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      data: { medicalHistory },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProfile,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getMedicalHistory,
  updateMedicalHistory,
};
