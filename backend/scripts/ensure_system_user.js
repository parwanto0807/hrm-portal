
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSystemUser() {
    try {
        console.log('Checking for system user...');
        const existingUser = await prisma.sysUser.findUnique({
            where: { username: 'system' }
        });

        if (existingUser) {
            console.log('System user already exists.');
            return;
        }

        console.log('Checking for system karyawan...');
        let systemKaryawan = await prisma.karyawan.findUnique({
            where: { emplId: 'SYSTEM' }
        });

        if (!systemKaryawan) {
            console.log('Creating system karyawan...');
            systemKaryawan = await prisma.karyawan.create({
                data: {
                    emplId: 'SYSTEM',
                    nama: 'SYSTEM',
                    nik: '00000000000',
                    kdSts: 'AKTIF',
                    kdJns: 'TETAP',
                }
            });
        }

        console.log('Creating system user...');
        await prisma.sysUser.create({
            data: {
                username: 'system',
                password: 'system_dummy_password', // Should be hashed in real apps
                email: 'system@hrm.portal',
                name: 'System Account',
                active: true,
                legacyId: 0,
                positionId: 1, // Administrator
                emplId: 'SYSTEM'
            }
        });

        console.log('✅ System user created successfully.');

    } catch (error) {
        console.error('❌ Failed to create system user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSystemUser();
