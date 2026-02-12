import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const adminEmail = 'admin@hrm.com';
    const adminPassword = 'admin123';
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Administrator',
      },
      create: {
        email: adminEmail,
        password: adminPassword,
        role: 'SUPER_ADMIN',
        name: 'Super Administrator',
      },
    });
    console.log('Success:', admin);
  } catch (error) {
    console.error('ERROR_START');
    console.error(error);
    console.error('ERROR_END');
  } finally {
    await prisma.$disconnect();
  }
}

test();
