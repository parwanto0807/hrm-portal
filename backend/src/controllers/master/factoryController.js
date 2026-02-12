
import { prisma } from '../../config/prisma.js';

export const getFactories = async (req, res) => {
    try {
        const factories = await prisma.mstFact.findMany({
            orderBy: { kdFact: 'asc' }
        });
        res.json({ success: true, data: factories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createFactory = async (req, res) => {
    try {
        const { kdFact, nmFact, keterangan, lat, long, radius } = req.body;
        const newFactory = await prisma.mstFact.create({
            data: { kdFact, nmFact, keterangan, lat, long, radius: radius ? parseInt(radius) : 50 }
        });
        res.status(201).json({ success: true, data: newFactory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateFactory = async (req, res) => {
    try {
        const { code } = req.params;
        const { nmFact, keterangan, lat, long, radius } = req.body;
        const updatedFactory = await prisma.mstFact.update({
            where: { kdFact: code },
            data: { nmFact, keterangan, lat, long, radius: radius ? parseInt(radius) : 50 }
        });
        res.json({ success: true, data: updatedFactory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteFactory = async (req, res) => {
    try {
        const { code } = req.params;
        await prisma.mstFact.delete({ where: { kdFact: code } });
        res.json({ success: true, message: 'Factory deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
