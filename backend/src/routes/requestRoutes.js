// src/routes/requestRoutes.js
import express from 'express';
import {
    createRequest,
    getMyRequests,
    getPendingApprovals,
    getApprovalHistory,
    handleApproval,
    cancelRequest
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/my', getMyRequests);
router.get('/pending', getPendingApprovals);
router.get('/approvals/history', getApprovalHistory);
router.post('/:id/approve', handleApproval);
router.delete('/:id', cancelRequest);

export default router;
