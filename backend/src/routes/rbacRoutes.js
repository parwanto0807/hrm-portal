
import express from 'express';
import { getAllRoles, getAllMenus, getRolePermissions, updateRolePermissions } from '../controllers/rbacController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/roles', getAllRoles);
router.get('/menus', getAllMenus);
router.get('/permissions/:role', getRolePermissions);
router.put('/permissions/:role', updateRolePermissions);

export default router;
