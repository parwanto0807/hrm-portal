
import express from 'express';
import { getAccessHistory } from '../controllers/historyController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('SUPER_ADMIN'), getAccessHistory);

export default router;
