const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Current Users ---');
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true, employee: { select: { emplId: true } } }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- SysUsers ---');
  const sysUsers = await prisma.sysUser.findMany({
    select: { Username: true, email: true, emplId: true, legacyId: true }
  });
  console.log(JSON.stringify(sysUsers, null, 2));

  console.log('\n--- Recent Notifications ---');
  const notifications = await prisma.sysNotification.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, subject: true, note: true, recipientId: true, createdAt: true, isRead: true }
  });
  console.log(JSON.stringify(notifications, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
