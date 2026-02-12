import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'farhan', mode: 'insensitive' } }
    });
    console.log('USER_IN_DB:');
    console.log(JSON.stringify(user, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
