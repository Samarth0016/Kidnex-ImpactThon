import prisma from '../config/database.js';
import { calculateRiskScore, getRiskLevel } from '../utils/helpers.js';
import { calculateHealthRiskScore as geminiRiskScore } from '../config/gemini.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [profile, medicalHistory, recentDetections, healthLogs, medications] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.medicalHistory.findUnique({ where: { userId } }),
      prisma.detectionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.healthLog.findMany({
        where: { userId },
        orderBy: { logDate: 'desc' },
        take: 7,
      }),
      prisma.medication.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    // Calculate risk score
    const userData = { profile, medicalHistory, recentDetections };
    const riskScore = calculateRiskScore(userData);
    const riskLevel = getRiskLevel(riskScore);

    res.status(200).json({
      success: true,
      data: {
        profile,
        medicalHistory,
        recentDetections,
        healthLogs,
        medications,
        riskAssessment: {
          riskScore,
          riskLevel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHealthRiskScore = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        medicalHistory: true,
        detectionHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Use AI to calculate comprehensive risk score
    try {
      const aiRiskAssessment = await geminiRiskScore(userData);
      return res.status(200).json({
        success: true,
        data: aiRiskAssessment,
      });
    } catch (error) {
      // Fallback to simple calculation
      const riskScore = calculateRiskScore(userData);
      const riskLevel = getRiskLevel(riskScore);

      res.status(200).json({
        success: true,
        data: {
          riskScore,
          riskLevel,
          factors: [],
          recommendations: ['Maintain a healthy lifestyle', 'Regular health checkups'],
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getTrendAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const healthLogs = await prisma.healthLog.findMany({
      where: {
        userId,
        logDate: { gte: since },
      },
      orderBy: { logDate: 'asc' },
    });

    // Calculate trends
    const trends = {
      weight: healthLogs.map(log => ({ date: log.logDate, value: log.weight })).filter(d => d.value),
      bloodPressure: healthLogs.map(log => ({
        date: log.logDate,
        systolic: log.bloodPressureSystolic,
        diastolic: log.bloodPressureDiastolic,
      })).filter(d => d.systolic && d.diastolic),
      bloodSugar: healthLogs.map(log => ({ date: log.logDate, value: log.bloodSugar })).filter(d => d.value),
      heartRate: healthLogs.map(log => ({ date: log.logDate, value: log.heartRate })).filter(d => d.value),
    };

    res.status(200).json({
      success: true,
      data: { trends },
    });
  } catch (error) {
    next(error);
  }
};

export default { getDashboard, getHealthRiskScore, getTrendAnalytics };
