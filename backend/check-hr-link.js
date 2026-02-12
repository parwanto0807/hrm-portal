
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking HR Manager Link ---');
  
  // 1. Get HR Manager User
  const hrUser = await prisma.user.findFirst({
    where: { role: 'HR_MANAGER' }
  });

  if (!hrUser) {
    console.log('❌ No HR_MANAGER user found.');
    return;
  }

  console.log('User Found:', {
    id: hrUser.id,
    name: hrUser.name,
    email: hrUser.email,
    role: hrUser.role
  });

  // 2. Check Linked Karyawan
  const linkedEmployee = await prisma.karyawan.findFirst({
    where: {
      OR: [
        { userId: hrUser.id },
        { email: { equals: hrUser.email, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      emplId: true,
      nama: true,
      email: true,
      userId: true
    }
  });

  if (linkedEmployee) {
    console.log('✅ Linked Employee Found:', linkedEmployee);
  } else {
    console.log('❌ No linked Karyawan found for this user.');
    
    // 3. Optional: List some employees to see if we can manually link
    const sampleEmployees = await prisma.karyawan.findMany({
      take: 5,
      select: { emplId: true, nama: true, email: true, userId: true }
    });
    console.log('Sample Employees:', sampleEmployees);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
