import prisma from '../config/database.js';
import { calculateBMI } from '../utils/helpers.js';

export const createHealthLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    // Calculate BMI if weight provided
    if (data.weight) {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });
      if (profile && profile.height) {
        data.bmi = calculateBMI(data.weight, profile.height);
      }
    }

    const healthLog = await prisma.healthLog.create({
      data: {
        userId,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Health log created successfully',
      data: { healthLog },
    });
  } catch (error) {
    next(error);
  }
};

export const getHealthLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 30, offset = 0 } = req.query;

    const logs = await prisma.healthLog.findMany({
      where: { userId },
      orderBy: { logDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestHealthLog = async (req, res, next) => {
  try {
    const log = await prisma.healthLog.findFirst({
      where: { userId: req.user.id },
      orderBy: { logDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { log },
    });
  } catch (error) {
    next(error);
  }
};

export default { createHealthLog, getHealthLogs, getLatestHealthLog };
