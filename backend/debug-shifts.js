
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Dshift Sample ---');
  const dshifts = await prisma.dshift.findMany({ take: 2 });
  console.log(JSON.stringify(dshifts, null, 2));

  console.log('--- TimeWork Sample ---');
  const timeWorks = await prisma.timeWork.findMany({ take: 2 });
  console.log(JSON.stringify(timeWorks, null, 2));

  console.log('--- Karyawan Sample ---');
  const employee = await prisma.karyawan.findFirst({
    select: { emplId: true, groupShift: true, kdCmpy: true }
  });
  console.log(JSON.stringify(employee, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
