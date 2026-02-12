
import { prisma } from '../config/prisma.js';

/**
 * Log a system event to SysEventHistory
 * @param {Object} params - Logging parameters
 * @param {string} params.logUser - Username or User identifier
 * @param {string} params.modul - Module name (e.g., 'AUTH', 'EMPLOYEE')
 * @param {string} params.action - Action performed (e.g., 'LOGIN', 'CREATE', 'UPDATE')
 * @param {any} [params.data] - Additional data to log (will be stringified)
 * @param {string} [params.ipAddress] - IP address of the requester
 * @param {string} [params.userAgent] - User agent of the requester
 */
export const sysLog = async ({ logUser, modul, action, data, ipAddress, userAgent }) => {
    try {
        await prisma.sysEventHistory.create({
            data: {
                legacyId: Math.floor(Math.random() * 1000000000), // Random legacy ID
                logUser: logUser || 'system',
                modul: modul || 'SYSTEM',
                action: action || 'UNKNOWN',
                data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null,
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
                datetime: new Date()
            }
        });
    } catch (error) {
        console.error('🔥 Failed to write SysLog:', error.message);
    }
};
