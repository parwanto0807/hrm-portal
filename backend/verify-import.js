/* verify-import.js */
async function run() {
    console.log("Triggering Employee Import...");
    try {
        const response = await fetch('http://localhost:5002/api/mysql/import/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (data.success) {
            console.log("✅ Import successful!");
        } else {
            console.error("❌ Import failed:", data.message);
            if (data.errorSample) {
                console.error("Error Samples:", data.errorSample);
            }
        }
    } catch (error) {
        console.error("❌ Network Error:", error.message);
    }
}

run();
