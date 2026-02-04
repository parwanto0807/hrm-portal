
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting manual linkage migration (ESM)...');
  
  try {
    const users = await prisma.user.findMany();
    console.log(`🔍 Found ${users.length} users.`);
    
    let linkedCount = 0;
    
    for (const user of users) {
      if (!user.email) continue;
      
      const email = user.email.trim();
      
      const employee = await prisma.karyawan.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });
      
      if (employee) {
        await prisma.karyawan.update({
          where: { id: employee.id },
          data: { userId: user.id }
        });
        console.log(`✅ Linked User ${user.email} (ID: ${user.id}) to Employee ${employee.nama}`);
        linkedCount++;
      }
    }
    
    console.log(`\n✨ Migration complete. Linked ${linkedCount} records.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
