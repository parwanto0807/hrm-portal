import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../../controllers/master/company/companyController.js";
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Endpoint: /api/companies (sesuaikan dengan prefix di index.js)

router.get("/", protect, getCompanies);             // GET All
router.get("/:id", protect, getCompanyById);        // GET One by ID
router.post("/", protect,authorize('ADMIN'), createCompany);           // CREATE
router.patch("/:id", protect,authorize('ADMIN'), updateCompany);       // UPDATE (Gunakan PATCH untuk update parsial)
router.delete("/:id", protect,authorize('ADMIN'), deleteCompany);      // DELETE

export default router;