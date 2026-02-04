
import express from 'express';
import {
    getEmployeeLevels,
    createEmployeeLevel,
    updateEmployeeLevel,
    deleteEmployeeLevel
} from '../../controllers/master/employeeLevelController.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getEmployeeLevels); // Public read access to avoid 401
router.post('/', protect, createEmployeeLevel);
router.put('/:code', protect, updateEmployeeLevel);
router.delete('/:code', protect, deleteEmployeeLevel);

export default router;
