// src/routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();
import { getEmployeeStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.middleware.js';

// All dashboard routes are protected
router.use(protect);

/**
 * @route   GET /api/dashboard/stats/employee
 * @desc    Get dashboard statistics for the logged-in employee
 * @access  Private (Employee)
 */
// Multer setup for memory storage (process with sharp before saving)
import multer from 'multer';
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

import { getCheckInStatus, submitCheckIn } from '../controllers/absentController.js';

/**
 * @route   GET /api/dashboard/stats/employee
 * @desc    Get dashboard statistics for the logged-in employee
 * @access  Private (Employee)
 */
router.get('/stats/employee', getEmployeeStats);

/**
 * @route   GET /api/dashboard/attendance/status
 * @desc    Get check-in status (Shift, Factory, Today's Log)
 * @access  Private (Employee)
 */
router.get('/attendance/status', getCheckInStatus);

/**
 * @route   POST /api/dashboard/attendance/check-in
 * @desc    Submit check-in/out with location and photo
 * @access  Private (Employee)
 */
router.post('/attendance/check-in', upload.single('photo'), submitCheckIn);

export default router;
