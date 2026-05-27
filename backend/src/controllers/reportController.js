import { prisma } from '../config/prisma.js';

export const getKpiReport = async (req, res) => {
    try {
        const { tahun, periode, dept } = req.query;

        let where = {};
        if (tahun) where.tahun = parseInt(tahun);
        if (periode) where.periode = parseInt(periode);

        const data = await prisma.kpiEmployee.findMany({
            where,
            include: {
                karyawan: {
                    select: {
                        nama: true,
                        nik: true,
                        dept: { select: { kdDept: true, nmDept: true } },
                        jabatan: { select: { nmJab: true } }
                    }
                }
            },
            orderBy: {
                totalNilai: 'desc'
            }
        });

        // Filter dept if needed since it's nested
        const filtered = dept && dept !== 'all' 
            ? data.filter(d => d.karyawan?.dept?.kdDept === dept)
            : data;

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        console.error('Error in getKpiReport:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPph21Report = async (req, res) => {
    try {
        const { tahun } = req.query;
        if (!tahun) throw new Error('Tahun diperlukan');
        const filterYear = parseInt(tahun);

        // We fetch all payroll records for the given year using string matching for period (e.g. '202401' to '202412')
        const gajiRecords = await prisma.gaji.findMany({
            where: {
                period: { startsWith: String(filterYear) }
            },
            select: {
                emplId: true,
                nama: true,
                nik: true,
                kdCmpy: true,
                tPph21: true,
                gKotor: true,
            }
        });

        // Aggregate by employee
        const aggregated = {};
        for (const g of gajiRecords) {
            if (!aggregated[g.emplId]) {
                aggregated[g.emplId] = {
                    emplId: g.emplId,
                    nama: g.nama,
                    nik: g.nik,
                    kdCmpy: g.kdCmpy,
                    totalBruto: 0,
                    totalPph21: 0,
                    bulanAktif: 0
                };
            }
            aggregated[g.emplId].totalBruto += parseFloat(g.gKotor || 0);
            aggregated[g.emplId].totalPph21 += parseFloat(g.tPph21 || 0);
            aggregated[g.emplId].bulanAktif += 1;
        }

        const dataList = Object.values(aggregated).sort((a, b) => b.totalPph21 - a.totalPph21);

        res.status(200).json({ success: true, data: dataList });
    } catch (error) {
        console.error('Error in getPph21Report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOvertimeReport = async (req, res) => {
    try {
        const { periode, dept } = req.query; // format '202401'

        let where = {};
        if (periode) where.periode = periode;

        const data = await prisma.lembur.findMany({
            where,
            include: {
                karyawan: {
                    select: {
                        nama: true,
                        dept: { select: { kdDept: true, nmDept: true } },
                        pokokBln: true,
                        jnsJamRef: { select: { jnsJam: true } }
                    }
                }
            },
            orderBy: { tglLembur: 'desc' }
        });

        // Add some estimated cost logic (simple standard formula: 1/173 * base salary * hours)
        const enriched = data.map(L => {
            const upahPokok = parseFloat(L.karyawan?.pokokBln || 0);
            const totalJam = parseFloat(L.totLembur || 0);
            const estimasiBiaya = (upahPokok > 0 && totalJam > 0) ? (upahPokok / 173) * totalJam : 0;
            return {
                ...L,
                estimasiBiaya
            };
        });

        const filtered = dept && dept !== 'all'
            ? enriched.filter(d => d.karyawan?.dept?.kdDept === dept)
            : enriched;

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        console.error('Error in getOvertimeReport:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHrAnalytics = async (req, res) => {
    try {
        const totalEmployees = await prisma.karyawan.count({ where: { kdSts: 'AKTIF' } });
        const employeesLeftThisMonth = await prisma.karyawan.count({ 
            where: { 
                kdSts: 'TIDAK_AKTIF', 
                // in real app, we filter by date, let's say anything with kdSts=KELUAR
            } 
        });

        // Demografi: Gender
        const genderStats = await prisma.karyawan.groupBy({
            by: ['kdSex'],
            where: { kdSts: 'AKTIF' },
            _count: { kdSex: true }
        });

        // Demografi: Department
        const deptStatsRaw = await prisma.karyawan.findMany({
            where: { kdSts: 'AKTIF' },
            select: { dept: { select: { nmDept: true } } }
        });
        
        const deptMap = {};
        for(let d of deptStatsRaw) {
            const name = d.dept?.nmDept || 'N/A';
            deptMap[name] = (deptMap[name] || 0) + 1;
        }
        const deptStats = Object.keys(deptMap).map(k => ({ name: k, count: deptMap[k] }));

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                employeesLeftThisMonth,
                genderStats,
                deptStats
            }
        });
    } catch (error) {
        console.error('Error in getHrAnalytics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
