import { prisma } from '../config/prisma.js';

export const getAllPositions = async (req, res) => {
    try {
        const positions = await prisma.mstJab.findMany({
            orderBy: { kdJab: 'asc' }
        });
        console.log('GET POSITIONS:', positions.length, 'records');
        res.status(200).json({ success: true, data: positions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPositionByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const position = await prisma.mstJab.findUnique({
            where: { kdJab: code }
        });
        if (!position) return res.status(404).json({ success: false, message: 'Position not found' });
        res.status(200).json({ success: true, data: position });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPosition = async (req, res) => {
    const { 
        kdJab, nmJab, nTjabatan, nTransport, 
        nShiftAll, nPremiHdr, persenRmh, persenPph, keterangan 
    } = req.body;
    try {
        const newPosition = await prisma.mstJab.create({
            data: { 
                kdJab, nmJab, 
                nTjabatan: nTjabatan || 0, 
                nTransport: nTransport || 0,
                nShiftAll: nShiftAll || 0,
                nPremiHdr: nPremiHdr || 0,
                persenRmh: persenRmh || 0,
                persenPph: persenPph || 0,
                keterangan 
            }
        });
        res.status(201).json({ success: true, data: newPosition });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePosition = async (req, res) => {
    const { code } = req.params;
    const { 
        nmJab, nTjabatan, nTransport, 
        nShiftAll, nPremiHdr, persenRmh, persenPph, keterangan 
    } = req.body;
    try {
        const updatedPosition = await prisma.mstJab.update({
            where: { kdJab: code },
            data: { 
                nmJab, 
                nTjabatan: nTjabatan || 0, 
                nTransport: nTransport || 0,
                nShiftAll: nShiftAll || 0,
                nPremiHdr: nPremiHdr || 0,
                persenRmh: persenRmh || 0,
                persenPph: persenPph || 0,
                keterangan 
            }
        });
        res.status(200).json({ success: true, data: updatedPosition });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePosition = async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.mstJab.delete({
            where: { kdJab: code }
        });
        res.status(200).json({ success: true, message: 'Position deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
