
import { prisma } from '../config/prisma.js';

export const getAccessHistory = async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;

        const where = {};
        if (search) {
            where.OR = [
                { logUser: { contains: search, mode: 'insensitive' } },
                { modul: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
                { data: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [history, total] = await Promise.all([
            prisma.sysEventHistory.findMany({
                where,
                take: parseInt(limit),
                skip: parseInt(offset),
                orderBy: { datetime: 'desc' },
            }),
            prisma.sysEventHistory.count({ where })
        ]);

        // Manually attach user info for display
        const enrichedHistory = await Promise.all(history.map(async (log) => {
            const sysUser = await prisma.sysUser.findUnique({
                where: { username: log.logUser },
                select: { name: true, emplId: true }
            });
            return {
                ...log,
                user: sysUser || { name: log.logUser, emplId: 'N/A' }
            };
        }));

        res.json({
            success: true,
            history: enrichedHistory,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createLog = async (req, res) => {
    try {
        const { modul, action, data } = req.body;
        const logUser = req.user?.username || 'system';

        const newLog = await prisma.sysEventHistory.create({
            data: {
                legacyId: Math.floor(Math.random() * 1000000), // Legacy fallback
                logUser,
                modul,
                action,
                data: typeof data === 'string' ? data : JSON.stringify(data),
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                datetime: new Date()
            }
        });

        res.status(201).json({ success: true, log: newLog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
