import express from 'express';
import {
    getAllPositions,
    getPositionByCode,
    createPosition,
    updatePosition,
    deletePosition
} from '../controllers/positionController.js';

const router = express.Router();

router.get('/', getAllPositions);
router.get('/:code', getPositionByCode);
router.post('/', createPosition);
router.put('/:code', updatePosition);
router.delete('/:code', deletePosition);

export default router;
