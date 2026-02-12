import { PrismaClient } from '@prisma/client';
import { ensureSysUser } from './src/utils/userSync.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Sync for Known Users ---');
  // Users seen in previous run:
  const testEmplIds = ['000000699', '000000705'];
  
  for (const emplId of testEmplIds) {
    console.log(`Syncing emplId: ${emplId}...`);
    await ensureSysUser(emplId);
  }

  console.log('\n--- Current Users (hrm_system.public.User) ---');
  const users = await prisma.user.findMany({
    select: { 
      email: true, 
      role: true, 
      name: true, 
      employee: { select: { emplId: true } } 
    }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- SysUsers (hrm_system.public.SysUser) ---');
  const sysUsers = await prisma.sysUser.findMany({
    select: { 
      username: true, 
      email: true, 
      emplId: true, 
      legacyId: true 
    }
  });
  console.log(JSON.stringify(sysUsers, null, 2));

  console.log('\n--- Recent Notifications ---');
  const notifications = await prisma.sysNotification.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { 
      id: true, 
      subject: true, 
      note: true, 
      recipientId: true, 
      createdAt: true, 
      isRead: true 
    }
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
