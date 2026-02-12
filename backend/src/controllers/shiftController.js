import { prisma } from '../config/prisma.js';
import { addDays, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';


/**
 * Get all Group Shifts
 */
export const getGroupShifts = async (req, res) => {
    try {
        const groups = await prisma.groupShift.findMany({
            where: { isActive: true },
            include: { patternRef: true },
            orderBy: { groupShift: 'asc' }
        });
        res.json({ success: true, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Shift Matrix (Dshift) for a specific period and group
 */
export const getDshift = async (req, res) => {
    try {
        const { periode, groupShiftId } = req.query;
        if (!periode || !groupShiftId) {
            return res.status(400).json({ success: false, message: 'Periode and GroupShiftId are required' });
        }

        // Get default company
        const company = await prisma.company.findFirst();
        if (!company) {
            return res.status(404).json({ success: false, message: 'No company found in database' });
        }

        const dshift = await prisma.dshift.findUnique({
            where: {
                dshift_unique: {
                    periode,
                    groupShiftId,
                    kdCmpy: company.kodeCmpy
                }
            }
        });

        res.json({ success: true, data: dshift });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Upsert Shift Matrix (Dshift)
 */
export const upsertDshift = async (req, res) => {
    try {
        const { periode, groupShiftId, ...shifts } = req.body;
        
        const company = await prisma.company.findFirst();
        if (!company) {
            return res.status(404).json({ success: false, message: 'No company found in database' });
        }

        const dshift = await prisma.dshift.upsert({
            where: {
                dshift_unique: {
                    periode,
                    groupShiftId,
                    kdCmpy: company.kodeCmpy
                }
            },
            update: {
                ...shifts,
                updatedAt: new Date()
            },
            create: {
                periode,
                groupShiftId,
                kdCmpy: company.kodeCmpy,
                ...shifts
            }
        });

        res.json({ success: true, data: dshift });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all Shift Types (JnsJam)
 */
export const getShiftTypes = async (req, res) => {
    try {
        const types = await prisma.jnsJam.findMany({
            where: { isActive: true },
            orderBy: { kdJam: 'asc' }
        });
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Shift Type
 */
export const createShiftType = async (req, res) => {
    try {
        const { kdJam, jnsJam, jmShif, jamMasuk, jamKeluar, isActive } = req.body;

        // Use raw query or any cast to bypass stale client validation
        // Since we know the column exists but client is locked
        const newShift = await prisma.$executeRaw`
            INSERT INTO "jnsjam" ("id", "KD_JAM", "JNS_JAM", "JMSHIF", "JAM_MASUK", "JAM_KELUAR", "is_active", "created_at", "updated_at")
            VALUES (gen_random_uuid(), ${kdJam}, ${jnsJam}, ${parseInt(jmShif) || 1}, ${jamMasuk}, ${jamKeluar}, ${isActive}, NOW(), NOW())
        `;
        
        // Return dummy success since we can't easily fetch the new ID without more complex raw query
        res.json({ success: true, data: { kdJam, jnsJam } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Shift Type
 */
export const updateShiftType = async (req, res) => {
    try {
        const { id } = req.params;
        const { kdJam, jnsJam, jmShif, jamMasuk, jamKeluar, isActive } = req.body;
        
        // Use raw query to bypass stale client validation
        await prisma.$executeRaw`
            UPDATE "jnsjam"
            SET "KD_JAM" = ${kdJam},
                "JNS_JAM" = ${jnsJam},
                "JMSHIF" = ${parseInt(jmShif) || 1},
                "JAM_MASUK" = ${jamMasuk},
                "JAM_KELUAR" = ${jamKeluar},
                "is_active" = ${isActive},
                "updated_at" = NOW()
            WHERE "id" = ${id}::uuid
        `;

        res.json({ success: true, data: { id, kdJam, jnsJam } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Shift Type
 */
export const deleteShiftType = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.jnsJam.delete({ where: { id } });
        res.json({ success: true, message: 'Shift deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Group Shift
 */
export const createGroupShift = async (req, res) => {
    try {
        const { groupShift, groupName, isActive, patternId, patternRefDate } = req.body;
        const newGroup = await prisma.groupShift.create({
            data: { 
                groupShift, 
                groupName, 
                isActive,
                patternId,
                patternRefDate: patternRefDate ? new Date(patternRefDate) : null
            }
        });
        res.json({ success: true, data: newGroup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Group Shift
 */
export const updateGroupShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { groupShift, groupName, isActive, patternId, patternRefDate } = req.body;
        const updated = await prisma.groupShift.update({
            where: { id },
            data: { 
                groupShift,
                groupName, 
                isActive,
                patternId,
                patternRefDate: patternRefDate ? new Date(patternRefDate) : null
            }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Group Shift
 */
export const deleteGroupShift = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.groupShift.delete({ where: { id } });
        res.json({ success: true, message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Sync Group Matrix to All Employees in the Group (Absent Table)
 */
export const syncShiftToAbsent = async (req, res) => {
    try {
        const { periode, groupShiftId } = req.body;
        
        // 1. Get the matrix
        const company = await prisma.company.findFirst();
        if (!company) {
            return res.status(404).json({ success: false, message: 'No company found' });
        }

        const dshift = await prisma.dshift.findUnique({
            where: { dshift_unique: { periode, groupShiftId, kdCmpy: company.kodeCmpy } }
        });

        if (!dshift) {
            return res.status(404).json({ success: false, message: 'Shift matrix not found for this group and period' });
        }

        // 2. Get all employees in this group
        const employees = await prisma.karyawan.findMany({
            where: { groupShiftId, kdSts: 'AKTIF' },
            select: { emplId: true, nik: true, nama: true }
        });

        if (employees.length === 0) {
            return res.status(404).json({ success: false, message: 'No active employees found in this group' });
        }

        // 3. Prepare expansion
        const year = parseInt(periode.substring(0, 4));
        const month = parseInt(periode.substring(4, 6)); // 1-indexed
        const daysInMonth = new Date(year, month, 0).getDate();

        // Get Shift info (stdMasuk/stdKeluar) for mapping
        // This is simplified: in reality, we need to fetch time details from TimeWork or JnsJam
        // Assuming kdJam maps to Shift Code
        const shiftTypes = await prisma.jnsJam.findMany();
        const shiftMap = new Map(shiftTypes.map(s => [s.kdJam, s]));

        let syncCount = 0;

        // Iterate over days and employees
        for (let day = 1; day <= daysInMonth; day++) {
            const dayKey = `shift${day.toString().padStart(2, '0')}`;
            const kdJam = dshift[dayKey]?.toString();
            
            if (!kdJam || kdJam === '0' || kdJam === 'null') continue;

            const tglAbsen = new Date(Date.UTC(year, month - 1, day));
            
            // Bulk upsert for each employee on this day
            // Note: Prisma createMany with onConflict is not always available depending on DB, 
            // but we'll use a loop or Promise.all for safety with Postgres.
            await Promise.all(employees.map(async (emp) => {
                const shiftEntry = shiftMap.get(kdJam);
                return prisma.absent.upsert({
                    where: {
                        absent_unique: {
                            emplId: emp.emplId,
                            tglAbsen: tglAbsen
                        }
                    },
                    update: {
                        jnsJamId: shiftEntry?.id,
                        kdJam: kdJam,
                        groupShiftId: groupShiftId,
                        periode: periode,
                        updatedAt: new Date()
                    },
                    create: {
                        emplId: emp.emplId,
                        tglAbsen: tglAbsen,
                        nik: emp.nik,
                        nama: emp.nama,
                        jnsJamId: shiftEntry?.id,
                        kdJam: kdJam,
                        groupShiftId: groupShiftId,
                        periode: periode,
                        kdCmpy: company.kodeCmpy
                    }
                });
            }));
            syncCount += employees.length;
        }

        res.json({ 
            success: true, 
            message: `Successfully synced ${syncCount} schedules for ${employees.length} employees.` 
        });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Generate Shift Matrix for a group based on its assigned ShiftPattern
 */
export const generateMatrixFromPattern = async (req, res) => {
    try {
        const { periode, groupShiftId } = req.body;
        
        // 1. Fetch GroupShift with Pattern
        const group = await prisma.groupShift.findUnique({
            where: { id: groupShiftId },
            include: { patternRef: true }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Grup tidak ditemukan.' });
        }

        if (!group.patternId || !group.patternRefDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Grup ini belum memiliki Pola Shift atau Tanggal Referensi.' 
            });
        }

        const patternArray = group.patternRef.pattern.split(',').map(s => s.trim());
        const refDate = new Date(group.patternRefDate);
        
        // 2. Prepare period dates
        const year = parseInt(periode.substring(0, 4));
        const month = parseInt(periode.substring(4, 6));
        const startDate = new Date(year, month - 1, 1);
        const lastDate = endOfMonth(startDate);
        const daysInMonth = lastDate.getDate();

        // 3. Prepare matrix data
        const shifts = {};
        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month - 1, d);
            // Calculate offset (days since refDate)
            const offset = differenceInDays(currentDate, refDate);
            
            // Handle modular arithmetic for patterns
            const patternLen = patternArray.length;
            const index = ((offset % patternLen) + patternLen) % patternLen;
            
            const dayKey = `shift${d.toString().padStart(2, '0')}`;
            shifts[dayKey] = patternArray[index];
        }

        // 4. Get Company
        const company = await prisma.company.findFirst();
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        // 5. Upsert to Dshift
        const dshift = await prisma.dshift.upsert({
            where: {
                dshift_unique: {
                    periode,
                    groupShiftId,
                    kdCmpy: company.kodeCmpy
                }
            },
            update: {
                ...shifts,
                updatedAt: new Date()
            },
            create: {
                periode,
                groupShiftId,
                kdCmpy: company.kodeCmpy,
                ...shifts
            }
        });

        res.json({ success: true, data: dshift, message: 'Jadwal otomatis berhasil dibuat berdasarkan pola.' });
    } catch (error) {
        console.error('Generate Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

