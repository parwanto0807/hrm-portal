import { prisma } from '../config/prisma.js';

/**
 * Ensures a SysUser record exists in the legacy system for a given emplId.
 * This is required because notifications and audit logs are tied to SysUser. legacyId.
 * 
 * @param {string} emplId - The employee ID to sync
 * @returns {Promise<Object|null>} The SysUser record
 */
export const ensureSysUser = async (identifier) => {
    if (!identifier) return null;

    try {
        // 1. Check if SysUser already exists (by emplId, email, or username)
        let sysUser = await prisma.sysUser.findFirst({
            where: { 
                OR: [
                    { emplId: identifier },
                    { email: identifier },
                    { username: identifier }
                ]
             }
        });

        if (sysUser) {
            // If it exists but lacks a legacyId, generate one
            if (sysUser.legacyId === null) {
                const legacyId = Math.floor(Math.random() * 1000000);
                sysUser = await prisma.sysUser.update({
                    where: { id: sysUser.id },
                    data: { legacyId }
                });
            }
            return sysUser;
        }

        // 2. If not found, determine what kind of identifier we have
        // Try to find a modern User or Karyawan to populate data
        const karyawan = await prisma.karyawan.findFirst({
            where: { 
                OR: [
                    { emplId: identifier },
                    { email: { equals: identifier, mode: 'insensitive' } }
                ]
            }
        });

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: (identifier.length > 20) ? identifier : undefined }, // Assume UUID if long
                    { email: { equals: identifier, mode: 'insensitive' } }
                ]
            }
        });

        if (!karyawan && !user) {
            console.warn(`⚠️ [ensureSysUser] No source data found for identifier: ${identifier}`);
            return null;
        }

        // 3. Create new SysUser record
        const legacyId = Math.floor(Math.random() * 1000000);
        let finalEmplId = karyawan?.emplId || `USR_${user?.id?.substring(0, 5) || 'GUEST'}`;
        
        // CRITICAL: Check if Karyawan exists for the finalEmplId to avoid FK violation
        // SysUser.emplId references Karyawan.emplId
        // If we are using a generated ID like USR_..., it won't exist in Karyawan, so we can't link it.
        // However, SysUser.emplId is a foreign key. 
        // We must check if `finalEmplId` actually exists in Karyawan table.
        
        let validEmplId = finalEmplId;
        
        if (karyawan) {
            validEmplId = karyawan.emplId;
        } else {
            validEmplId = null;
        }


        const finalUsername = karyawan?.nik || user?.email?.split('@')[0] || `user_${validEmplId}`;
        
        sysUser = await prisma.sysUser.create({
            data: {
                legacyId,
                username: finalUsername,
                email: user?.email || karyawan?.email || `${validEmplId}@local.host`,
                password: 'linked_account',
                name: karyawan?.nama || user?.name || 'Unknown User',
                nik: karyawan?.nik || validEmplId || "",
                emplId: validEmplId, // Must exist in Karyawan
                positionId: 0,
                active: true,
                fcmToken: user?.fcmToken || null
            }
        });


        return sysUser;
    } catch (error) {
        console.error(`❌ [ensureSysUser] Error syncing user ${identifier}:`, error.message);
        return null;
    }
};
