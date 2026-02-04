
const fetch = require('node-fetch');

async function testFilters() {
    const baseUrl = 'http://localhost:5002/api/employees';
    
    // Test cases
    const tests = [
        { name: 'No Filters', params: {} },
        { name: 'With Dept', params: { kdDept: 'HRD' } }, // Assume 'HRD' exists or use a likely code
        { name: 'With Job', params: { kdJab: '01' } },   // Assume '01' exists
        { name: 'With Status', params: { kdSts: 'AKTIF' } }
    ];

    console.log('Starting API Filter Tests...\n');

    for (const test of tests) {
        try {
            const query = new URLSearchParams(test.params).toString();
            const url = `${baseUrl}?${query}`;
            console.log(`Testing [${test.name}]: ${url}`);
            
            const res = await fetch(url);
            console.log(`Status: ${res.status} ${res.statusText}`);
            
            if (!res.ok) {
                const text = await res.text();
                console.log('Error Body:', text);
            } else {
                const data = await res.json();
                console.log(`Success: Found ${data.pagination.total} employees`);
            }
        } catch (err) {
            console.error(`Request Failed:`, err.message);
        }
        console.log('-'.repeat(40));
    }
}

testFilters();
