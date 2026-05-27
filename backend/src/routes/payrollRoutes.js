import express from 'express';
import {
    getPayrollPeriods,
    createPayrollPeriod,
    getPayrollDetail,
    generateProtectedPayslip,
    // Engine endpoints baru
    calculatePayroll,
    closePeriod,
    reopenPeriod,
    previewPayrollEmployee,
    getKonfigBpjs,
    saveKonfigBpjs,
    getTarifTER,
    getPayrollLog,
    getSkalaUpah,
    saveSkalaUpah,
    deleteSkalaUpah,
} from '../controllers/payrollController.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// ── Periode Payroll ────────────────────────────────────────────
router.get('/my',                        getPayrollPeriods);
router.get('/periods',                   getPayrollPeriods);
router.post('/periods',                  createPayrollPeriod);
router.get('/periods/:id/details',       getPayrollDetail);

// ── Kalkulasi Engine ───────────────────────────────────────────
router.post('/periods/:id/calculate',    calculatePayroll);       // Hitung gaji semua karyawan
router.get('/periods/:id/preview/:emplId', previewPayrollEmployee); // Preview 1 karyawan
router.post('/periods/:id/close',        closePeriod);            // Closing periode
router.post('/periods/:id/reopen',       reopenPeriod);           // Buka kembali (SUPER_ADMIN)

// ── Slip Gaji ──────────────────────────────────────────────────
router.post('/generate-protected',       generateProtectedPayslip);

// ── Konfigurasi Master ─────────────────────────────────────────
router.get('/config/bpjs',              getKonfigBpjs);
router.post('/config/bpjs',             saveKonfigBpjs);
router.get('/config/tarif-ter',         getTarifTER);

// ── Audit Trail ────────────────────────────────────────────────
router.get('/log/:periodeId',           getPayrollLog);

// ── Skala Upah ─────────────────────────────────────────────────
router.get('/config/skala-upah',        getSkalaUpah);
router.post('/config/skala-upah',       saveSkalaUpah);
router.put('/config/skala-upah/:id',    saveSkalaUpah);
router.delete('/config/skala-upah/:id', deleteSkalaUpah);

export default router;

