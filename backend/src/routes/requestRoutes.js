// src/routes/requestRoutes.js
import express from 'express';
import {
    createRequest,
    getMyRequests,
    getPendingApprovals,
    getApprovalHistory,
    handleApproval,
    cancelRequest,
    getAllRequests
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/all', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), getAllRequests);
router.post('/', createRequest);
router.get('/my', getMyRequests);
router.get('/pending', getPendingApprovals);
router.get('/approvals/history', getApprovalHistory);
router.post('/:id/approve', handleApproval);
router.delete('/:id', cancelRequest);

export default router;
