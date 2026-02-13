// src/controllers/requestController.js
import { prisma } from '../config/prisma.js';
import firebaseAdmin from '../config/firebaseAdmin.js';
import { createNotification } from '../utils/notification.js';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/**
 * Submit a new request (Cuti, Ijin, Pulang Cepat, Dinas Luar)
 */
export const createRequest = async (req, res) => {
    try {
        const { type, startDate, endDate, reason, attachments } = req.body;
        const emplId = req.user.emplId;

        if (!emplId) {
            console.error(`User ${req.user.email} (ID: ${req.user.id}) has no associated Karyawan record.`);
            return res.status(400).json({
                success: false,
                message: `Akun anda (${req.user.email}) belum terhubung dengan data karyawan. Silakan hubungi HR.`
            });
        }

        // Sanitize dates
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;

        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid start date format' });
        }

        const request = await prisma.pengajuan.create({
            data: {
                emplId,
                type,
                startDate: start,
                endDate: end,
                reason,
                attachments,
                status: 'PENDING',
                currentStep: 1
            }
        });

        // 4. Send Notifications (Push & DB)
        try {
            const requesterName = req.user.namaKaryawan || req.user.name || 'Seseorang';
            const requesterId = req.user.id;
            
            // A. Notify Admins & HR Manager
            const admins = await prisma.user.findMany({
                where: {
                    role: { in: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'] }
                },
                select: { id: true, email: true, fcmToken: true, employee: { select: { emplId: true } } }
            });

            // 1. Send Push to Admins (if Firebase is ready)
            if (firebaseAdmin) {
                const adminTokens = admins.map(admin => admin.fcmToken).filter(token => !!token);
                if (adminTokens.length > 0) {
                     const message = {
                        notification: {
                            title: 'Pengajuan Baru',
                            body: `${requesterName} telah membuat pengajuan ${type}`
                        },
                        tokens: adminTokens
                    };
                    firebaseAdmin.messaging().sendEachForMulticast(message).catch(e => console.error(e));
                }
            }

            // 2. Save DB Notification for Admins (ALWAYS)
            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    emplId: admin.employee?.emplId,
                    subject: 'Pengajuan Baru',
                    note: `${requesterName} telah membuat pengajuan ${type}`,
                    type: 2,
                    creatorUuid: requesterId,
                    url: '/dashboard/leaves' // Admins review leaves here
                });
            }

            // B. Notify Requester
            // 1. Send Push to Requester (if Firebase is ready)
            if (firebaseAdmin) {
                let requesterToken = req.user.fcmToken;
                if (!requesterToken) {
                     const requesterUser = await prisma.user.findUnique({
                        where: { id: requesterId },
                        select: { fcmToken: true }
                    });
                    requesterToken = requesterUser?.fcmToken;
                }
                
                if (requesterToken) {
                    const message = {
                        notification: {
                            title: 'Pengajuan Berhasil Dibuat',
                            body: `Pengajuan ${type} Anda sedang diproses.`
                        },
                        token: requesterToken
                    };
                    firebaseAdmin.messaging().send(message).catch(e => console.error(e));
                }
            }

            // 2. Save DB Notification for Requester (ALWAYS)
             await createNotification({
                emplId: emplId,
                subject: 'Pengajuan Berhasil Dibuat',
                note: `Pengajuan ${type} Anda sedang diproses.`,
                type: 2,
                creatorUuid: requesterId, // Self-created notification
                url: '/dashboard/leaves' // Users track their requests here
            });

        } catch (err) {
            console.error('⚠️ Failed to send notifications:', err);
        }

        res.status(201).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
};

/**
 * Get requests for current user
 */
export const getMyRequests = async (req, res) => {
    try {
        const emplId = req.user.emplId;

        // CRITICAL: Ensure emplId exists
        if (!emplId) {
             return res.status(400).json({
                success: false,
                message: 'User account is not linked to any Employee data.'
            });
        }

        const requests = await prisma.pengajuan.findMany({
            where: { emplId },
            include: {
                karyawan: {
                    select: {
                        nama: true,
                        emplId: true,
                        kdDept: true,
                        superior: { select: { nama: true, emplId: true } },
                        superior2: { select: { nama: true, emplId: true } }
                    }
                },
                approvals: {
                    include: {
                        approver: {
                            select: { nama: true, kdJab: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests'
        });
    }
};

/**
 * Get requests pending approval for the current user (Superior)
 */
export const getPendingApprovals = async (req, res) => {
    try {
        const approverId = req.user.emplId;
        const isHR = req.user.role === 'HR_MANAGER';

        // CRITICAL: Ensure approver has emplId (unless purely role-based like HR, but even then commonly linked)
        if (!approverId && !isHR) {
             return res.status(200).json({
                success: true,
                data: []
            });
        }

        // Find requests where the current user is the valid approver for the current step
        const requests = await prisma.pengajuan.findMany({
            where: {
                OR: [
                    // Level 1: User is the direct superior and currentStep is 1
                    {
                        currentStep: 1,
                        karyawan: { superiorId: approverId },
                        status: 'PENDING'
                    },
                    // Level 2: User is the explicit second superior and currentStep is 2
                    {
                        currentStep: 2,
                        karyawan: { superior2Id: approverId },
                        status: 'IN_PROGRESS'
                    },
                    // Level 3: User is HR Manager and currentStep is 3
                    ...(isHR ? [{
                        currentStep: 3,
                        status: 'IN_PROGRESS'
                    }] : [])
                ]
            },
            include: {
                karyawan: {
                    select: { 
                        nama: true, 
                        emplId: true, 
                        kdDept: true,
                        superior: {
                            select: { nama: true, emplId: true }
                        },
                        superior2: {
                            select: { nama: true, emplId: true }
                        }
                    }
                },
                approvals: {
                    include: {
                        approver: {
                            select: { nama: true, kdJab: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending approvals'
        });
    }
};

/**
 * Get history of approvals processed by the current user
 */
export const getApprovalHistory = async (req, res) => {
    try {
        const approverId = req.user.emplId;

        // Find requests where the user has already provided an approval/rejection
        const requests = await prisma.pengajuan.findMany({
            where: {
                approvals: {
                    some: {
                        approverId: approverId
                    }
                }
            },
            include: {
                karyawan: {
                    select: { 
                        nama: true, 
                        emplId: true, 
                        kdDept: true,
                        superior: {
                            select: { nama: true, emplId: true }
                        },
                        superior2: {
                            select: { nama: true, emplId: true }
                        }
                    }
                },
                approvals: {
                    include: {
                        approver: {
                            select: { nama: true, kdJab: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching approval history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approval history'
        });
    }
};

/**
 * Approve or Reject a request
 */
export const handleApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, startDate, endDate } = req.body;
        const approverId = req.user.emplId;
        const userRole = req.user.role;
        const isManagement = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(userRole);
        const isHR = userRole === 'HR_MANAGER';

        // Log context for debugging


        let request = await prisma.pengajuan.findUnique({
            where: { id },
            include: { 
                karyawan: {
                    include: {
                        superior: true,
                        superior2: true
                    }
                } 
            }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Feature: Allow HR_MANAGER to modify dates during approval
        if (isHR && (startDate || endDate)) {

            request = await prisma.pengajuan.update({
                where: { id },
                data: {
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined
                },
                include: { 
                    karyawan: {
                        include: {
                            superior: true,
                            superior2: true
                        }
                    } 
                }
            });
        }

        // Validate Authorization for the specific step
        let authorized = false;
        
        // 1. Management override (SUPER_ADMIN, ADMIN, HR_MANAGER can approve any step via Management Dashboard)
        if (isManagement) {
            authorized = true;
        } 
        // 2. Step-based hierarchy check for standard managers
        else if (request.currentStep === 1 && request.karyawan.superiorId === approverId) {
            authorized = true;
        } else if (request.currentStep === 2 && request.karyawan.superior2Id === approverId) {
            authorized = true;
        }
        // HR check is already covered by isManagement, but kept for clarity in logic flow
        else if (request.currentStep === 3 && isHR) {
            authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ 
                success: false, 
                message: 'Anda tidak memiliki wewenang untuk menyetujui tahap ini.' 
            });
        }

        // CRITICAL: Ensure approver has emplId for database relation
        if (!approverId) {
            return res.status(400).json({
                success: false,
                message: 'Akun Anda tidak terhubung dengan data Karyawan. Persetujuan tidak dapat dicatat.'
            });
        }

        // Create approval log
        await prisma.approvalLog.create({
            data: {
                pengajuanId: id,
                approverId,
                level: request.currentStep,
                status,
                remarks
            }
        });

        // Determine next status and step
        let newStatus = request.status;
        let nextStep = request.currentStep;

        if (status === 'REJECTED') {
            newStatus = 'REJECTED';
        } else if (status === 'APPROVED') {
            if (request.currentStep === 1) {
                // If Level 1 approves, check if Level 2 exists
                if (request.karyawan.superior2Id) {
                    nextStep = 2;
                    newStatus = 'IN_PROGRESS';
                } else {
                    // No Level 2, skip to HR (Level 3)
                    nextStep = 3;
                    newStatus = 'IN_PROGRESS';
                }
            } else if (request.currentStep === 2) {
                // If Level 2 approves, go to HR (Level 3)
                nextStep = 3;
                newStatus = 'IN_PROGRESS';
            } else if (request.currentStep === 3) {
                // Final approval from HR
                newStatus = 'APPROVED';
            }
        }

        const updatedRequest = await prisma.pengajuan.update({
            where: { id },
            data: {
                status: newStatus,
                currentStep: nextStep
            }
        });

        // Sync to Absent only on final approval
        if (newStatus === 'APPROVED') {
            await syncToAbsent(request);
        }

        // Notification to Requester (Push & DB)
        try {
            // Get Requester FCM Token
            const requester = await prisma.user.findFirst({
                where: { employee: { emplId: request.emplId } },
                select: { fcmToken: true }
            });

            const requesterToken = requester?.fcmToken;
            const actionText = status === 'APPROVED' ? 'disetujui' : 'ditolak';
            const title = `Pengajuan ${actionText}`;
            
            // Handle date modification notice
            const isDateModified = startDate || endDate;
            const modifiedNotice = isDateModified ? ' dengan penyesuaian tanggal' : '';
            
            // Custom Format: DD-MMM-YYYY (e.g., 12-Feb-2026)
            const formattedDate = format(new Date(request.startDate), 'dd-MMM-yyyy', { locale: idLocale });
            const requesterName = request.karyawan.nama;
            const approverName = req.user.namaKaryawan || req.user.name || 'Admin';
            
            const body = `Pengajuan Tanggal ${formattedDate} (${requesterName}) Anda telah ${actionText}${modifiedNotice} oleh ${approverName}.`;

            // 1. Send Push Notification
            if (firebaseAdmin && requesterToken) {
                const message = {
                    notification: {
                        title: title,
                        body: body
                    },
                    token: requesterToken
                };
                firebaseAdmin.messaging().send(message).catch(e => console.error('Push Error:', e));
            }

            // 2. Save DB Notification
            await createNotification({
                emplId: request.emplId,
                subject: title,
                note: body,
                type: 2, // Type 2 for Request
                creatorUuid: approverId, // The approver is the creator of this notification
                url: '/dashboard/leaves' // Requester sees the result in their list
            });

        } catch (error) {
            console.error('Failed to send approval notification:', error);
        }

        res.status(200).json({
            success: true,
            message: `Pengajuan ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`,
            data: updatedRequest
        });
    } catch (error) {
        console.error('Error handling approval:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memproses persetujuan'
        });
    }
};

/**
 * Cancel a request by the requester
 */
export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const emplId = req.user.emplId;

        const request = await prisma.pengajuan.findUnique({
            where: { id }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Verify ownership
        if (request.emplId !== emplId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
        }

        // Only allow cancellation if not already final
        if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(request.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Tidak dapat membatalkan pengajuan yang sudah ${request.status.toLowerCase()}.` 
            });
        }

        await prisma.pengajuan.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        // Log cancellation
        await prisma.approvalLog.create({
            data: {
                pengajuanId: id,
                approverId: emplId,
                level: request.currentStep,
                status: 'CANCELLED',
                remarks: 'Dibatalkan oleh pembuat pengajuan'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Pengajuan berhasil dibatalkan'
        });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membatalkan pengajuan'
        });
    }
};

/**
 * Get all requests (for SUPER_ADMIN, ADMIN, HR_MANAGER)
 */
export const getAllRequests = async (req, res) => {
    try {
        const { status, type, search } = req.query;

        const where = {
            AND: [
                status ? { status } : {},
                type ? { type } : {},
                search ? {
                    OR: [
                        { karyawan: { nama: { contains: search, mode: 'insensitive' } } },
                        { karyawan: { emplId: { contains: search, mode: 'insensitive' } } },
                        { karyawan: { nik: { contains: search, mode: 'insensitive' } } }
                    ]
                } : {}
            ]
        };

        const requests = await prisma.pengajuan.findMany({
            where,
            include: {
                karyawan: {
                    select: { 
                        nama: true, 
                        emplId: true, 
                        nik: true,
                        kdDept: true,
                        dept: { select: { nmDept: true } },
                        superior: { select: { nama: true, emplId: true } },
                        superior2: { select: { nama: true, emplId: true } }
                    }
                },
                approvals: {
                    include: {
                        approver: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all requests'
        });
    }
};

/**
 * Placeholder for syncing approved requests to the Absent table
 */
async function syncToAbsent(request) {
    // Implement logic to insert into `Absent` table based on type
    // e.g., if CUTI, insert record into Absent with kdAbsen = 'C'

}
