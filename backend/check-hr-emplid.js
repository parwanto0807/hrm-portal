
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'HR_MANAGER' },
    select: { id: true, email: true, name: true, role: true, emplId: true }
  });
  console.log('HR Managers:', JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
