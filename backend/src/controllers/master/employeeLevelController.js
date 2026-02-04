
import { prisma } from '../../config/prisma.js';

export const getEmployeeLevels = async (req, res) => {
    try {
        const levels = await prisma.mstPkt.findMany({
            orderBy: { kdPkt: 'asc' }
        });
        res.json({ success: true, data: levels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createEmployeeLevel = async (req, res) => {
    try {
        const { kdPkt, nmPkt, keterangan } = req.body;
        const newLevel = await prisma.mstPkt.create({
            data: { kdPkt, nmPkt, keterangan }
        });
        res.status(201).json({ success: true, data: newLevel });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateEmployeeLevel = async (req, res) => {
    try {
        const { code } = req.params;
        const { nmPkt, keterangan } = req.body;
        const updatedLevel = await prisma.mstPkt.update({
            where: { kdPkt: code },
            data: { nmPkt, keterangan }
        });
        res.json({ success: true, data: updatedLevel });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteEmployeeLevel = async (req, res) => {
    try {
        const { code } = req.params;
        await prisma.mstPkt.delete({ where: { kdPkt: code } });
        res.json({ success: true, message: 'Employee level deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
