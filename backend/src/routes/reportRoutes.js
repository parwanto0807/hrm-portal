import express from 'express';
import {
    getKpiReport,
    getPph21Report,
    getOvertimeReport,
    getHrAnalytics
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure all report routes

router.get('/kpi', getKpiReport);
router.get('/pph21', getPph21Report);
router.get('/overtime', getOvertimeReport);
router.get('/analytics', getHrAnalytics);

export default router;
