import { prisma } from '../config/prisma.js';
import { ensureSysUser } from './userSync.js';

/**
 * Create a notification for a user in the SysNotification table.
 * 
 * @param {Object} params - Notification parameters
 * @param {string} [params.userId] - Modern User ID (UUID)
 * @param {string} [params.emplId] - Employee ID (EMPL_ID)
 * @param {string} params.subject - Notification subject
 * @param {string} params.note - Notification message
 * @param {string} [params.url] - Action URL
 * @param {number} [params.type] - Notification type
 * @param {number} [params.creatorId] - Creator SysUser legacyId (default: 0 for system)
 */
export const createNotification = async ({ 
    userId, 
    emplId, 
    subject, 
    note, 
    url = '', 
    type = 0, 
    creatorId = 0, // Legacy ID (optional)
    creatorUuid = null // Modern UUID (preferred)
}) => {
    try {
        let recipientLegacyId = null;
        let targetEmplId = emplId;
        let finalCreatorId = creatorId;

        // 1. Resolve emplId if only userId is provided
        if (!targetEmplId && userId) {
            const karyawan = await prisma.karyawan.findUnique({
                where: { userId },
                select: { emplId: true }
            });
            targetEmplId = karyawan?.emplId;
        }

        // 2. Ensure SysUser exists and get recipient legacyId
        if (targetEmplId) {
            const sysUser = await ensureSysUser(targetEmplId);
            recipientLegacyId = sysUser?.legacyId;
        }

        if (!recipientLegacyId && recipientLegacyId !== 0) {
            console.warn(`⚠️ [createNotification] Could not resolve recipient legacyId for emplId: ${targetEmplId}`);
            return;
        }

        // 3. Resolve Creator Legacy ID from UUID if provided
        if (creatorUuid) {
            const creatorUser = await prisma.sysUser.findFirst({
                where: { 
                    // Assuming SysUser is linked to Main User via some field or we lookup by email/username match?
                    // Wait, SysUser structure: id (UUID), legacyId (Int), email, username...
                    // And Main User (Prisma 'User') is separate.
                    // Actually, let's check if we can find SysUser by email matching the creator's email if possible,
                    // BUT req.user.id is from the 'User' table (NextAuth). 
                    // If SysUser and User are synced (which they should be for 'ensureSysUser'),
                    // we might need to find the SysUser that corresponds to the Creator.
                    
                    // Strategy: Find User by UUID -> Get Email -> Find SysUser by Email
                    // OR if 'User' table has `sysUserId`, use that.
                    // Let's rely on Email for sync as `ensureSysUser` does.
                }
            });

            // Re-reading ensureSysUser logic might be good, but for now let's assume we can query SysUser 
            // We usually sync by email or username. 
            // Let's first get the User record to get the email.
            const user = await prisma.user.findUnique({
                where: { id: creatorUuid },
                select: { email: true }
            });

            if (user?.email) {
                const creatorSysUser = await prisma.sysUser.findUnique({
                    where: { email: user.email },
                    select: { legacyId: true }
                });
                if (creatorSysUser) {
                    finalCreatorId = creatorSysUser.legacyId;
                }
            }
        }

        await prisma.sysNotification.create({
            data: {
                legacyId: Math.floor(Math.random() * 1000000000),
                creatorUserId: finalCreatorId,
                type: type,
                subject: subject,
                note: note,
                url: url,
                status: true,
                isRead: false,
                recipientId: recipientLegacyId
            }
        });
        

    } catch (error) {
        console.error('❌ [createNotification] Error:', error.message);
    }
};
