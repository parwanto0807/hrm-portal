
import { prisma } from '../config/prisma.js';

export const getAllRoles = async (req, res) => {
    try {
        const roles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'GUEST'];
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllMenus = async (req, res) => {
    try {
        const menus = await prisma.menu.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, menus });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getRolePermissions = async (req, res) => {
    try {
        const { role } = req.params;
        const permissions = await prisma.roleMenu.findMany({
            where: { role: role },
            include: { menu: true }
        });
        res.json({ success: true, permissions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateRolePermissions = async (req, res) => {
    try {
        const { role } = req.params;
        const { menuIds } = req.body; // Array of menu IDs

        await prisma.$transaction(async (tx) => {
            // Delete current permissions
            await tx.roleMenu.deleteMany({
                where: { role: role }
            });

            // Add new permissions
            if (menuIds && menuIds.length > 0) {
                await tx.roleMenu.createMany({
                    data: menuIds.map(id => ({
                        role: role,
                        menuId: id
                    }))
                });
            }
        });

        res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
