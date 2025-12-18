
import express from 'express';
import { uploadMiddleware, uploadCompanyLogo } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/upload/company-logo
router.post('/company-logo', protect, uploadMiddleware, uploadCompanyLogo);

export default router;
