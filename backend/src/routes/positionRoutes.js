import express from 'express';
import {
    getAllPositions,
    getPositionByCode,
    createPosition,
    updatePosition,
    deletePosition
} from '../controllers/positionController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllPositions);
router.get('/:code', getPositionByCode);
router.post('/', protect, authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), createPosition);
router.put('/:code', protect, authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), updatePosition);
router.delete('/:code', protect, authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), deletePosition);

export default router;
