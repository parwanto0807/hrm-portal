import express from 'express';
import { 
    getPayrollPeriods, 
    createPayrollPeriod, 
    getPayrollDetail,
    generateProtectedPayslip
} from '../controllers/payrollController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
 
router.get('/my', getPayrollPeriods); // We'll update controller to handle 'my' logic or add specific function
router.get('/periods', getPayrollPeriods);
router.post('/periods', createPayrollPeriod);
router.get('/periods/:id/details', getPayrollDetail);
router.post('/generate-protected', generateProtectedPayslip);

export default router;
