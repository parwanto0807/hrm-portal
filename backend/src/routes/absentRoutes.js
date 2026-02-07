// src/routes/absentRoutes.js
import express from 'express';
import { 
    getAttendance, 
    updateAttendance, 
    getAttendanceStats 
} from '../controllers/absentController.js';
import { getAttLogs } from '../controllers/attLogController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply protection to all attendance routes
router.use(protect);

router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.get('/logs', getAttLogs);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateAttendance);

export default router;
