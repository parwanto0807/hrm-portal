const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log('Seeding Skala Upah data...');
    
    // Pastikan perusahaan GFI ada
    const cmpy = await prisma.company.findFirst();
    const kdCmpy = cmpy ? cmpy.kodeCmpy : 'GFI';

    const data = [
        {
            kdCmpy: kdCmpy,
            kdJab: null,
            golongan: 'I',
            namaGol: 'Operator / Staff Junior',
            upahMin: 5067381,
            upahMid: 5339430, // Referensi UMK Tangerang
            upahMax: 6000000,
            validDate: new Date('2026-01-01'),
            isActive: true
        },
        {
            kdCmpy: kdCmpy,
            kdJab: null,
            golongan: 'II',
            namaGol: 'Supervisor / Staff Senior',
            upahMin: 6000000,
            upahMid: 5339430,
            upahMax: 9000000,
            validDate: new Date('2026-01-01'),
            isActive: true
        },
        {
            kdCmpy: kdCmpy,
            kdJab: null,
            golongan: 'III',
            namaGol: 'Department Manager',
            upahMin: 9000000,
            upahMid: 5339430,
            upahMax: 16000000,
            validDate: new Date('2026-01-01'),
            isActive: true
        },
        {
            kdCmpy: kdCmpy,
            kdJab: null,
            golongan: 'IV',
            namaGol: 'General Manager / Direktur',
            upahMin: 16000000,
            upahMid: 5339430,
            upahMax: 25000000,
            validDate: new Date('2026-01-01'),
            isActive: true
        }
    ];

    // Hapus data skala upah yang ada
    await prisma.skalaUpah.deleteMany();
    
    // Masukkan contoh data
    await prisma.skalaUpah.createMany({ data });
    
    console.log('Berhasil mengisi contoh data Skala Upah sebanyak', data.length, 'baris!');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
