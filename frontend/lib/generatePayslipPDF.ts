import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface PayslipData {
    id: string;
    employeeName: string;
    employeeIdNumber: string;
    position: string;
    department: string;
    joinDate?: string; // TMK
    taxStatus?: string;

    baseSalary: number;
    pokokTrm: number; // Upah Dibayarkan
    lemburHours?: number;

    allowances: {
        tJabatan: number;
        tKhusus: number;
        lembur: number;
        rapel: number;
        tLain: number;
        admBank: number;
        [key: string]: number;
    };

    deductions: {
        jht: number;
        jpn: number;
        bpjs: number;
        pph21: number;
        potPinjaman: number;
        iuranKoperasi: number;
        lain: number;
        [key: string]: number;
    };

    totalAllowances: number;
    totalDeductions: number;
    netSalary: number;
}

export const generatePayslipPDF = (data: any[], periodName: string = '', periodId?: string) => {
    // Ensure periodName is a string
    let displayPeriod = periodName || 'Unknown_Period';

    // If periodId is available (e.g. "202512"), format it nicely (e.g. "PERIODE DESEMBER 2025")
    if (periodId && /^\d{6}$/.test(periodId)) {
        try {
            const year = parseInt(periodId.substring(0, 4));
            const month = parseInt(periodId.substring(4, 6)) - 1; // Months are 0-indexed in JS Date
            const dateObj = new Date(year, month, 1);

            // Format: "PERIODE DESEMBER 2025"
            const monthYear = format(dateObj, 'MMMM yyyy', { locale: localeId });
            displayPeriod = `PERIODE ${monthYear}`;
        } catch (e) {
            console.error("Invalid periodId for PDF", e);
        }
    }

    // 1/2 A4 Landscape: 210mm x 148mm
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [210, 148]
    });

    const width = 210;
    const height = 148;
    const margin = 15; // Safe area

    // Colors
    const bgDarkBlue = '#001f3f'; // Dark Navy
    const textWhite = '#FFFFFF';

    data.forEach((emp, index) => {
        if (index > 0) doc.addPage([210, 148], 'landscape');

        // 1. Background
        doc.setFillColor(bgDarkBlue);
        doc.rect(0, 0, width, height, 'F');

        // 1.5 Security Pattern (Company Name Watermark)
        const patternText = "PT. GRAFINDO MITRASEMESTA   ";
        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.setTextColor('#334e68'); // Muted Blue-Grey for subtle watermark
        // Calculate text dimensions
        const textWidth = doc.getTextWidth(patternText);
        const textHeight = 3.5;

        // Loop to fill page
        for (let y = 4; y < height; y += textHeight) {
            let xOffset = (y % (textHeight * 2) === 0) ? 0 : 10;

            for (let x = 13 - 20; x < width - 13; x += textWidth) {
                const drawX = x + xOffset;
                if (drawX > width - 13) continue;
                if (drawX + textWidth < 13) continue;
                doc.text(patternText, drawX, y, { baseline: 'top' });
            }
        }

        // 2. Continuous Form Rails (White Side Strips)
        doc.setFillColor('#FFFFFF');
        doc.rect(0, 0, 13, height, 'F'); // Left Rail
        doc.rect(width - 13, 0, 13, height, 'F'); // Right Rail

        // 3. Continuous Form Holes (Black)
        doc.setFillColor('#000000');
        const holeRadius = 2;
        const holeSpacing = 12.7; // 1/2 inch standard
        const startY = 6;

        // Side Holes
        for (let y = startY; y < height; y += holeSpacing) {
            doc.circle(6, y, holeRadius, 'F');
            doc.circle(width - 6, y, holeRadius, 'F');
        }

        // Perforation Lines
        doc.setDrawColor('#cccccc');
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(13, 0, 13, height);
        doc.line(width - 13, 0, width - 13, height);
        doc.setLineDashPattern([], 0); // Reset to solid

        // === HEADER CONTENT ===
        doc.setTextColor(textWhite);
        doc.setFont('courier', 'bold');

        // Title Centered
        doc.setFontSize(12);
        doc.text('SLIP GAJI KARYAWAN', width / 2, 15, { align: 'center' });
        doc.text(`BULAN ${displayPeriod.toUpperCase()}`, width / 2, 20, { align: 'center' });

        // Left Info
        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        const leftX = margin + 5;
        const leftValueX = leftX + 25;

        doc.text('Nama', leftX, 30);
        doc.text(`: ${emp.employeeName}`, leftValueX - 2, 30); // Add colon alignment

        doc.text('N I K', leftX, 35);
        doc.text(`: ${emp.employeeIdNumber}`, leftValueX - 2, 35);

        // TMK
        if (emp.joinDate) {
            const tmkDate = new Date(emp.joinDate).toLocaleDateString('id-ID');
            const tmkX = leftValueX + 45; // Separation
            doc.text(`TMK ${tmkDate}`, tmkX, 35);
        }

        // Right Info
        const rightX = width / 2 + 20;
        const rightValueX = rightX + 25;

        doc.text('Bagian', rightX, 30);
        doc.text(`: ${(emp.section || '').toUpperCase()}`, rightValueX, 30);

        doc.text('Jabatan', rightX, 35);
        doc.text(`: ${emp.position || ''}`, rightValueX, 35);

        doc.text('Stat Pajak', rightX, 40);
        doc.text(`: ${emp.taxStatus || '-'}`, rightValueX, 40);

        // === BODY CONTENT (2 Columns) ===
        const col1X = margin + 5;
        const col1ValueX = width / 2 - 10; // Right align for numbers
        const col2X = width / 2 + 5;
        const col2ValueX = width - margin - 5; // Right align for numbers

        let yPos = 55;

        // Column Headers
        doc.setFont('courier', 'normal');
        doc.text('A. Pendapatan', col1X, yPos);
        doc.text('B. Potongan', col2X, yPos);

        yPos += 5;

        // Formatter
        const formatRp = (num: number) => new Intl.NumberFormat('id-ID').format(num);

        // A. PENDAPATAN
        const earnings = [
            { label: 'Gaji Pokok', value: emp.baseSalary },
            { label: 'Upah Dibayarkan', value: emp.pokokTrm || emp.baseSalary }, // Use pokokTrm (actual paid salary)
            { label: 'Tunjangan Jabatan', value: emp.allowances?.tJabatan },
            { label: 'Tunjangan Khusus', value: emp.allowances?.tKhusus },
            { label: `Lembur  ${(emp.lemburHours || 0).toFixed(2)} Jam`, value: emp.allowances?.lembur },
            { label: 'Rapel', value: emp.allowances?.rapel },
            { label: 'Lain-lain', value: emp.allowances?.tLain },
            { label: 'Adm Bank', value: emp.allowances?.admBank }
        ];

        // B. POTONGAN
        const deductionsList = [
            { label: 'Jaminan Hari Tua (JHT)', value: emp.deductions?.jht },
            { label: 'Jaminan Pensiun (JPN)', value: emp.deductions?.jpn },
            { label: 'BPJS Kesehatan', value: emp.deductions?.bpjs },
            { label: 'Pph 21', value: emp.deductions?.pph21 },
            { label: 'Pot. Pinjaman', value: emp.deductions?.potPinjaman },
            { label: 'Iuran Koperasi', value: emp.deductions?.iuranKoperasi },
            { label: 'Lain-Lain', value: emp.deductions?.lain }
        ];

        // Draw Rows
        const maxRows = Math.max(earnings.length, deductionsList.length);

        // Helper to draw dotted line or just colon? 
        // Screenshot shows ":" aligned cleanly.

        for (let i = 0; i < maxRows; i++) {
            // Draw Left Col
            if (earnings[i]) {
                doc.text(earnings[i].label, col1X + 5, yPos);
                // Draw colon at fixed pos
                doc.text(':', col1ValueX - 35, yPos);
                doc.text(formatRp(earnings[i].value || 0), col1ValueX, yPos, { align: 'right' });
            }
            // Draw Right Col
            if (deductionsList[i]) {
                doc.text(deductionsList[i].label, col2X + 5, yPos);
                doc.text(':', col2ValueX - 35, yPos);
                doc.text(formatRp(deductionsList[i].value || 0), col2ValueX, yPos, { align: 'right' });
            }
            yPos += 5;
        }

        // Divider Lines for Totals
        yPos += 2;
        doc.setDrawColor(textWhite); // Using textWhite for lines on dark bg
        doc.setLineWidth(0.3);

        // Left Total Line (Under numbers)
        doc.line(col1ValueX - 40, yPos, col1ValueX + 2, yPos);
        // Right Total Line
        doc.line(col2ValueX - 40, yPos, col2ValueX + 2, yPos);

        yPos += 5;

        // Totals Row
        doc.text('JUMLAH A', col1ValueX - 50, yPos, { align: 'right' });
        doc.text(':', col1ValueX - 35, yPos);
        doc.text(formatRp(emp.totalAllowances || 0), col1ValueX, yPos, { align: 'right' });

        doc.text('JUMLAH B', col2ValueX - 50, yPos, { align: 'right' });
        doc.text(':', col2ValueX - 35, yPos);
        doc.text(formatRp(emp.totalDeductions || 0), col2ValueX, yPos, { align: 'right' });

        yPos += 10;

        // NET PAY
        // "GAJI DIBAYARKAN" aligned with Right Column
        doc.text('GAJI DIBAYARKAN', col2ValueX - 50, yPos, { align: 'right' });
        doc.text(':', col2ValueX - 35, yPos);
        doc.setFontSize(11);
        doc.setFont('courier', 'bold');
        doc.text(formatRp(emp.netSalary || 0), col2ValueX, yPos, { align: 'right' });
    });

    const filename = `Slip_Gaji_${displayPeriod.replace(/\s+/g, '_').toUpperCase()}.pdf`;
    doc.save(filename);
};
