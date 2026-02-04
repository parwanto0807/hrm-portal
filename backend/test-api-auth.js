// Test API access
async function testApi() {
    try {
        console.log('Testing GET http://localhost:5002/api/employees ...');
        const response = await fetch('http://localhost:5002/api/employees');
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        
        if (response.status === 401) {
            console.log('✅ CONFIRMED: 401 Unauthorized. User needs to login.');
        } else if (response.status === 200) {
            console.log('⚠️ UNEXPECTED: 200 OK. Route is not protected?');
        } else {
            console.log('❓ Other status:', response.status);
            const text = await response.text();
            console.log('Body:', text);
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

testApi();
