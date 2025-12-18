import { prisma } from "../../../config/prisma.js";

// 1. CREATE: Tambah Company Baru
export const createCompany = async (req, res) => {
  const {
    kodeCmpy,
    company,
    address1,
    address2,
    address3,
    tlp,
    fax,
    npwp,
    director,
    npwpDir,
    logo,
    npp,
    astekBayar,
    email,
    homepage,
    hrdMng,
    npwpMng,
  } = req.body;

  try {
    // Validasi sederhana: kodeCmpy wajib unik
    const existingCompany = await prisma.company.findUnique({
      where: { kodeCmpy },
    });

    if (existingCompany) {
      return res.status(400).json({ msg: "Kode Company sudah terdaftar" });
    }

    const newCompany = await prisma.company.create({
      data: {
        kodeCmpy,
        company,
        address1,
        address2,
        address3,
        tlp,
        fax,
        npwp,
        director,
        npwpDir,
        logo,
        npp,
        astekBayar,
        email,
        homepage,
        hrdMng,
        npwpMng,
      },
    });

    res.status(201).json({
      msg: "Company berhasil dibuat",
      data: newCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// 2. READ: Ambil Semua Company
export const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: 'desc', // Urutkan dari yang terbaru
      },
    });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// 3. READ: Ambil Satu Company berdasarkan ID
export const getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: { id: id },
    });

    if (!company) {
      return res.status(404).json({ msg: "Company tidak ditemukan" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// 4. UPDATE: Edit Data Company
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const data = req.body; // Ambil semua field dari body

  try {
    // Cek apakah data ada
    const checkCompany = await prisma.company.findUnique({
      where: { id: id },
    });

    if (!checkCompany) return res.status(404).json({ msg: "Company tidak ditemukan" });

    // Lakukan update
    const updatedCompany = await prisma.company.update({
      where: { id: id },
      data: data, // Prisma hanya akan mengupdate field yang dikirim di body
    });

    res.status(200).json({
      msg: "Company berhasil diupdate",
      data: updatedCompany,
    });
  } catch (error) {
    // Handle error unique constraint jika kodeCmpy diubah ke yang sudah ada
    if (error.code === 'P2002') {
      return res.status(400).json({ msg: "Kode Company sudah digunakan oleh data lain" });
    }
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// 5. DELETE: Hapus Company
export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const checkCompany = await prisma.company.findUnique({
      where: { id: id },
    });

    if (!checkCompany) return res.status(404).json({ msg: "Company tidak ditemukan" });

    await prisma.company.delete({
      where: { id: id },
    });

    res.status(200).json({ msg: "Company berhasil dihapus" });
  } catch (error) {
    // Handle foreign key constraint error (jika company dipakai di tabel Karyawan, dll)
    if (error.code === 'P2003') {
      return res.status(400).json({ msg: "Tidak dapat menghapus karena data masih berelasi dengan tabel lain" });
    }
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};