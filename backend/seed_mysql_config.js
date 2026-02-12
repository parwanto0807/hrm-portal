import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedConfig() {
    try {
        await prisma.mysqlConfig.create({
            data: {
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: '',
                database: 'grafindo_hrm', 
                isActive: true
            }
        });
        console.log('✅ MySQL config seeded with grafindo_hrm');
    } catch (error) {
        console.error('❌ Failed to seed MySQL config:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedConfig();
