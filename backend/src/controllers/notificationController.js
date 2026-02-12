import { prisma } from '../config/prisma.js';
import { ensureSysUser } from '../utils/userSync.js';

/**
 * Get notifications for the logged-in user
 */
export const getNotifications = async (req, res) => {
    try {
        // req.user.legacyId is now populated for all users in protect middleware
        const legacyId = req.user.legacyId;
        
        if (!legacyId && legacyId !== 0) {
            return res.status(200).json({ 
                success: true, 
                data: [], 
                pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
                message: 'No notifications found' 
            });
        }

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.sysNotification.findMany({
                where: {
                    recipientId: legacyId,
                    status: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: skip
            }),
            prisma.sysNotification.count({
                where: {
                    recipientId: legacyId,
                    status: true
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.sysNotification.update({
            where: { id },
            data: { isRead: true }
        });

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark all notifications as read for current user
 */
export const markAllAsRead = async (req, res) => {
    try {
        const emplId = req.user.emplId;
        
        const sysUser = await ensureSysUser(emplId);

        if (!sysUser) {
            return res.status(404).json({ success: false, message: 'SysUser not found' });
        }

        await prisma.sysNotification.updateMany({
            where: {
                recipientId: sysUser.legacyId,
                isRead: false
            },
            data: { isRead: true }
        });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
