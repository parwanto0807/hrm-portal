import express from "express";
import {
    getDivisions, createDivision, updateDivision, deleteDivision,
    getDepartments, createDepartment, updateDepartment, deleteDepartment,
    getSections, createSection, updateSection, deleteSection
} from "../../controllers/master/orgStructureController.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Divisions
router.get("/divisions", getDivisions);
router.post("/divisions", protect, createDivision);
router.put("/divisions/:code", protect, updateDivision);
router.delete("/divisions/:code", protect, deleteDivision);

// Departments
router.get("/departments", getDepartments);
router.post("/departments", protect, createDepartment);
router.put("/departments/:code", protect, updateDepartment);
router.delete("/departments/:code", protect, deleteDepartment);

// Sections
router.get("/sections", getSections);
router.post("/sections", protect, createSection);
router.put("/sections/:code", protect, updateSection);
router.delete("/sections/:code", protect, deleteSection);

export default router;
