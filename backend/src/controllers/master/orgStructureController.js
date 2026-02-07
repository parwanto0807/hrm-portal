import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// DIVISIONS (BAGIAN)
export const getDivisions = async (req, res) => {
    try {
        const data = await prisma.mstBag.findMany({
            orderBy: { kdBag: "asc" },
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDivision = async (req, res) => {
    const { kdBag, nmBag, keterangan } = req.body;
    try {
        const newData = await prisma.mstBag.create({
            data: { kdBag, nmBag, keterangan },
        });
        res.status(201).json({ success: true, data: newData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDivision = async (req, res) => {
    const { code } = req.params;
    const { nmBag, keterangan } = req.body;
    try {
        const updatedData = await prisma.mstBag.update({
            where: { kdBag: code },
            data: { nmBag, keterangan },
        });
        res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDivision = async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.mstBag.delete({ where: { kdBag: code } });
        res.status(200).json({ success: true, message: "Bagian berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DEPARTMENTS
export const getDepartments = async (req, res) => {
    try {
        const data = await prisma.mstDept.findMany({
            include: { bag: true },
            orderBy: { kdDept: "asc" },
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDepartment = async (req, res) => {
    const { kdDept, nmDept, kdBag, keterangan } = req.body;
    try {
        const newData = await prisma.mstDept.create({
            data: { kdDept, nmDept, kdBag, keterangan },
        });
        res.status(201).json({ success: true, data: newData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    const { code } = req.params;
    const { nmDept, kdBag, keterangan } = req.body;
    try {
        const updatedData = await prisma.mstDept.update({
            where: { kdDept: code },
            data: { nmDept, kdBag, keterangan },
        });
        res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.mstDept.delete({ where: { kdDept: code } });
        res.status(200).json({ success: true, message: "Departemen berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SECTIONS (SIE)
export const getSections = async (req, res) => {
    try {
        const { kdDept, kdBag } = req.query;
        const where = {};
        if (kdDept) where.kdDept = kdDept;
        if (kdBag) where.kdBag = kdBag;

        const data = await prisma.mstSie.findMany({
            where,
            include: { 
                bag: true,
                dept: true 
            },
            orderBy: { kdSeksie: "asc" },
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSection = async (req, res) => {
    const { kdSeksie, nmSeksie, kdBag, kdDept, keterangan } = req.body;
    try {
        const newData = await prisma.mstSie.create({
            data: { kdSeksie, nmSeksie, kdBag, kdDept, keterangan },
        });
        res.status(201).json({ success: true, data: newData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSection = async (req, res) => {
    const { code } = req.params;
    const { nmSeksie, kdBag, kdDept, keterangan } = req.body;
    try {
        const updatedData = await prisma.mstSie.update({
            where: { kdSeksie: code },
            data: { nmSeksie, kdBag, kdDept, keterangan },
        });
        res.status(200).json({ success: true, data: updatedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSection = async (req, res) => {
    const { code } = req.params;
    try {
        await prisma.mstSie.delete({ where: { kdSeksie: code } });
        res.status(200).json({ success: true, message: "Seksie berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
