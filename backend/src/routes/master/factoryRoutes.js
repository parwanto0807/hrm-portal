
import express from 'express';
import {
    getFactories,
    createFactory,
    updateFactory,
    deleteFactory
} from '../../controllers/master/factoryController.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getFactories);
router.post('/', protect, createFactory);
router.put('/:code', protect, updateFactory);
router.delete('/:code', protect, deleteFactory);

export default router;
