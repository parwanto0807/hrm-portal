import express from 'express';
import {
    getAllBanks,
    getBankByCode,
    createBank,
    updateBank,
    deleteBank
} from '../controllers/bankController.js';

const router = express.Router();

router.get('/', getAllBanks);
router.get('/:code', getBankByCode);
router.post('/', createBank);
router.put('/:code', updateBank);
router.delete('/:code', deleteBank);

export default router;
