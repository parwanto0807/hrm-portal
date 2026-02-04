// src/controllers/requestController.js
import { prisma } from '../config/prisma.js';

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

        const requests = await prisma.pengajuan.findMany({
            where: { emplId },
            include: {
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
        const { status, remarks } = req.body;
        const approverId = req.user.emplId;
        const isHR = req.user.role === 'HR_MANAGER';

        const request = await prisma.pengajuan.findUnique({
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

        // Validate Authorization for the specific step
        let authorized = false;
        if (request.currentStep === 1 && request.karyawan.superiorId === approverId) {
            authorized = true;
        } else if (request.currentStep === 2 && request.karyawan.superior2Id === approverId) {
            authorized = true;
        } else if (request.currentStep === 3 && isHR) {
            authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ 
                success: false, 
                message: 'Anda tidak memiliki wewenang untuk menyetujui tahap ini.' 
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
 * Placeholder for syncing approved requests to the Absent table
 */
async function syncToAbsent(request) {
    // Implement logic to insert into `Absent` table based on type
    // e.g., if CUTI, insert record into Absent with kdAbsen = 'C'
    console.log(`Syncing request ${request.id} to Absent table...`);
}
