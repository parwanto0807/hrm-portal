/**
 * Export Rekap Payroll ke Excel multi-sheet
 * Menggunakan SheetJS (xlsx) yang sudah include di most Next.js projects
 */

import { RekapPayrollRow, RekapPayrollSummary } from '@/types/payroll';

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID').format(Math.round(v || 0));

/** Convert data ke worksheet format (array of arrays) */
function buildDetailSheet(rows: RekapPayrollRow[]): unknown[][] {
    const headers = [
        'No', 'EMPL ID', 'NIK', 'Nama', 'Dept', 'Seksie', 'Jabatan',
        // A. Pendapatan
        'Gaji Pokok (Bln)', 'Upah Dibayar', 'T. Jabatan', 'T. Transport', 'T. Makan',
        'U. Shift', 'U. Lembur', 'Jam Lembur', 'THR', 'T. Lain', 'JUMLAH A',
        // B. Potongan
        'JHT (Kryw)', 'JP (Kryw)', 'JKN (Kryw)', 'PPh 21', 'Pot. Absen',
        'Angsuran', 'Koperasi', 'Pot. Lain', 'JUMLAH B',
        // THP
        'GAJI BERSIH (THP)',
        // BPJS Perusahaan
        'JHT (Prsh)', 'JKK (Prsh)', 'JKM (Prsh)', 'JP (Prsh)', 'JKN (Prsh)',
        'Status',
    ];

    const dataRows = rows.map((r, i) => [
        i + 1, r.emplId, r.nik, r.nama, r.nmDept, r.nmSeksie, r.nmJab,
        r.pokokBln, r.pokokTrm, r.tJabatan, r.tTransport, r.tMakan,
        r.totUShift, r.totULembur, r.totJLembur, r.thr, r.tunjLain, r.gKotor,
        r.jhtEmpl, r.jpnEmpl, r.jknEmpl, r.tPph21, r.potAbsen,
        r.pinjam, r.koperasi, r.potLain, r.totPotong,
        r.gBersih,
        r.jhtPerush, r.jkkPerush, r.jkmPerush, r.jpnPerush, r.jknPerush,
        r.closing ? 'Closed' : 'Open',
    ]);

    return [headers, ...dataRows];
}

function buildSummarySheet(summary: RekapPayrollSummary): unknown[][] {
    const rows: unknown[][] = [
        ['REKAP PAYROLL — ' + summary.periode.periodeNama],
        [],
        ['Total Karyawan', summary.totalKaryawan],
        ['Total Gaji Kotor', summary.totalGKotor],
        ['Total Potongan', summary.totalPotong],
        ['Total PPh 21', summary.totalPph21],
        ['Total BPJS TK (Karyawan)', summary.totalBpjsTk],
        ['Total BPJS Kesehatan (Karyawan)', summary.totalBpjsKes],
        ['Total BPJS Perusahaan', summary.totalBpjsPerush],
        ['Total Gaji Bersih (THP)', summary.totalGBersih],
        [],
        ['Per Departemen'],
        ['Dept', 'Nama Dept', 'Jml Karyawan', 'Total Gaji Kotor', 'Total THP'],
        ...summary.byDept.map(d => [
            d.kdDept, d.nmDept, d.count, d.totalGKotor, d.totalGBersih
        ]),
    ];
    return rows;
}

export async function exportPayrollToExcel(
    rows: RekapPayrollRow[],
    summary: RekapPayrollSummary,
    filename?: string
) {
    // Dynamic import to avoid SSR issues
    const XLSX = await import('xlsx');

    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = buildSummarySheet(summary);
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekap');

    // Sheet 2: Detail
    const detailData = buildDetailSheet(rows);
    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    wsDetail['!cols'] = [
        { wch: 4 }, { wch: 10 }, { wch: 14 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
        ...Array(27).fill({ wch: 16 }),
        { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Gaji');

    const fname = filename || `Rekap_Payroll_${summary.periode.periodeId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fname);
}

/** Export ringkas absensi ke Excel */
export async function exportAttendanceToExcel(
    rows: Array<Record<string, unknown>>,
    periodeNama: string,
    filename?: string
) {
    const XLSX = await import('xlsx');

    const headers = [
        'No', 'EMPL ID', 'NIK', 'Nama', 'Dept', 'Seksie',
        'Hadir', 'Alpha', 'Izin', 'Sakit', 'Cuti',
        'Hr Normal', 'Hr Lembur', 'Total Lembur (Jam)',
        'Terlambat (mnt)', 'Pulang Cepat (mnt)', '% Hadir',
    ];

    const data = rows.map((r, i) => [
        i + 1, r.emplId, r.nik, r.nama, r.nmDept, r.nmSeksie,
        r.hrHadir, r.hrAlpha, r.hrIzin, r.hrSakit, r.hrCuti,
        r.hrKerjaNormal, r.hrLembur, r.totalLembur,
        r.mntLambat, r.mntCepat,
        typeof r.persenHadir === 'number' ? `${r.persenHadir.toFixed(1)}%` : '',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [
        { wch: 4 }, { wch: 10 }, { wch: 14 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
        ...Array(11).fill({ wch: 12 }),
    ];
    XLSX.utils.book_append_sheet(wb, ws, `Absensi ${periodeNama}`);

    const fname = filename || `Rekap_Absensi_${periodeNama}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fname);
}
