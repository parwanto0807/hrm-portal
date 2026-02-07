
import fetch from 'node-fetch';

async function testApis() {
    const year = 2026;
    console.log(`Testing APIs for year ${year}...`);

    // 1. Primary
    try {
        console.log('--- Primary: dayoffapi.vercel.app ---');
        const res1 = await fetch(`https://dayoffapi.vercel.app/api?year=${year}`);
        const data = await res1.json();
        console.log('Status:', res1.status);
        console.log('First Item:', JSON.stringify(data[0], null, 2));
    } catch (e) {
        console.error('Primary failed:', e.message);
    }

    // 2. Backup
    try {
        console.log('\n--- Backup: date.nager.at ---');
        const res2 = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
        const text2 = await res2.text();
        console.log('Status:', res2.status);
        console.log('Body Preview:', text2.substring(0, 200));
    } catch (e) {
        console.error('Backup failed:', e.message);
    }
}

testApis();
