
import express from 'express';
import {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    syncHolidays
} from '../../controllers/master/holidayController.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public or Authenticated routes
router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('ADMIN', 'HR_MANAGER'), createHoliday);
router.put('/:id', authorize('ADMIN', 'HR_MANAGER'), updateHoliday);
router.delete('/:id', authorize('ADMIN', 'HR_MANAGER'), deleteHoliday);
router.post('/sync', authorize('ADMIN', 'HR_MANAGER'), syncHolidays);

export default router;
