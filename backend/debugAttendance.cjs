const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const employee = await prisma.karyawan.findFirst({
      where: { nama: { contains: 'ARISTUR WIYONO' } },
      include: {
        absent: {
          orderBy: { tglAbsen: 'asc' }
        }
      }
    });
    
    if (employee) {
      console.log(`Employee: ${employee.nama} (${employee.emplId})`);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Filter for Nov-Dec 2025
      const novDec = employee.absent.filter(a => {
        const d = new Date(a.tglAbsen);
        return d >= new Date('2025-11-01') && d <= new Date('2025-12-31');
      });

      novDec.forEach(a => {
        const d = new Date(a.tglAbsen);
        console.log(`${a.tglAbsen.toISOString().split('T')[0]} (${dayNames[d.getDay()]}): Status=${a.kdAbsen}, In=${a.realMasuk || '--:--'}, Out=${a.realKeluar || '--:--'}`);
      });
      
      console.log('--- Summary ---');
      const byDay = {};
      novDec.forEach(a => {
        const d = new Date(a.tglAbsen);
        const day = dayNames[d.getDay()];
        if (!byDay[day]) byDay[day] = { count: 0, hadir: 0 };
        byDay[day].count++;
        if (a.kdAbsen === 'H') byDay[day].hadir++;
      });
      console.log(byDay);

    } else {
      console.log('Employee not found');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
