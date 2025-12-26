import prisma from '../config/database.js';

export const addMedication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    // Only include fields that exist in the Medication schema
    const data = {};
    const allowedFields = ['name', 'dosage', 'frequency', 'startDate', 'endDate', 'isActive', 'reminderTimes', 'notes', 'sideEffects'];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        data[field] = body[field];
      }
    });

    // Convert date strings to proper DateTime format
    if (data.startDate) {
      data.startDate = new Date(data.startDate).toISOString();
    }
    if (data.endDate) {
      data.endDate = new Date(data.endDate).toISOString();
    }

    const medication = await prisma.medication.create({
      data: {
        userId,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: { medication },
    });
  } catch (error) {
    next(error);
  }
};

export const getMedications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { isActive } = req.query;

    const where = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const medications = await prisma.medication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { medications },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    // Verify ownership
    const existing = await prisma.medication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found',
      });
    }

    const medication = await prisma.medication.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: { medication },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.medication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found',
      });
    }

    await prisma.medication.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default { addMedication, getMedications, updateMedication, deleteMedication };
