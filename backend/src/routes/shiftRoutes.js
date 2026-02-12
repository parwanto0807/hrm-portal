import express from 'express';
import { 
    getGroupShifts, 
    createGroupShift,
    updateGroupShift,
    deleteGroupShift,
    getDshift, 
    upsertDshift, 
    getShiftTypes,
    createShiftType,
    updateShiftType,
    deleteShiftType,
    generateMatrixFromPattern,
    syncShiftToAbsent 
} from '../controllers/shiftController.js';
import {
    getPatterns,
    createPattern,
    updatePattern,
    deletePattern
} from '../controllers/patternController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected and typically for Admin/HR
router.use(protect);

router.get('/groups', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), getGroupShifts);
router.post('/groups', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), createGroupShift);
router.put('/groups/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), updateGroupShift);
router.delete('/groups/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), deleteGroupShift);

router.get('/matrix', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), getDshift);
router.post('/matrix', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), upsertDshift);

router.get('/types', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), getShiftTypes);
router.post('/types', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), createShiftType);
router.put('/types/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), updateShiftType);
router.delete('/types/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), deleteShiftType);

router.post('/generate', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), generateMatrixFromPattern);
router.post('/sync', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), syncShiftToAbsent);

// Patterns
router.get('/patterns', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), getPatterns);
router.post('/patterns', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), createPattern);
router.put('/patterns/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), updatePattern);
router.delete('/patterns/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), deletePattern);

export default router;
