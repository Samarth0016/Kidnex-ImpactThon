import express from 'express';
import { addMedication, getMedications, updateMedication, deleteMedication } from '../controllers/medication.controller.js';
import { protect } from '../middleware/auth.js';
import { medicationValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', medicationValidation, addMedication);
router.get('/', getMedications);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

export default router;
