import { prisma } from '../config/prisma.js';

export const getAllBanks = async (req, res) => {
    try {
        const banks = await prisma.bank.findMany({
            orderBy: { bankCode: 'asc' }
        });
        res.status(200).json({ success: true, data: banks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBankByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const bank = await prisma.bank.findUnique({
            where: { bankCode: code }
        });
        if (!bank) return res.status(404).json({ success: false, message: 'Bank not found' });
        res.status(200).json({ success: true, data: bank });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBank = async (req, res) => {
    const { bankCode, bankNama } = req.body;
    try {
        const newBank = await prisma.bank.create({
            data: { bankCode, bankNama }
        });
        res.status(201).json({ success: true, data: newBank });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBank = async (req, res) => {
    const { code } = req.params;
    const { bankNama } = req.body;
    try {
        const updatedBank = await prisma.bank.update({
            where: { bankCode: code },
            data: { bankNama }
        });
        res.status(200).json({ success: true, data: updatedBank });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBank = async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.bank.delete({
            where: { bankCode: code }
        });
        res.status(200).json({ success: true, message: 'Bank deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
