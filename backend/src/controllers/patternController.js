import { prisma } from '../config/prisma.js';

/**
 * Get all Shift Patterns
 */
export const getPatterns = async (req, res) => {
    try {
        const patterns = await prisma.shiftPattern.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: patterns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new Shift Pattern
 */
export const createPattern = async (req, res) => {
    try {
        const { name, description, pattern } = req.body;
        const newPattern = await prisma.shiftPattern.create({
            data: { name, description, pattern }
        });
        res.json({ success: true, data: newPattern });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update a Shift Pattern
 */
export const updatePattern = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, pattern, isActive } = req.body;
        const updated = await prisma.shiftPattern.update({
            where: { id },
            data: { name, description, pattern, isActive }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a Shift Pattern (Soft delete)
 */
export const deletePattern = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shiftPattern.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Pola shift berhasil dinonaktifkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
