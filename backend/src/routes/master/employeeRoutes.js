// src/routes/master/employeeRoutes.js
import express from 'express';
import {
    getEmployees,
    getEmployeeById,
    getEmployeePayroll,
    getPayrollHistory,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    verifyDob
} from '../../controllers/master/employeeController.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Employee CRUD routes
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.get('/:id/payroll', getEmployeePayroll);
router.get('/:id/history', getPayrollHistory);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.post('/verify-dob', verifyDob);
router.delete('/:id', deleteEmployee);

export default router;
