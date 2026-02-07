// src/tasks/cronTasks.js
import cron from 'node-cron';
import fetch from 'node-fetch';

export const initCronTasks = () => {
    // Schedule AttLog Sync every 10 minutes
    // This calls our own internal API to perform the sync
    cron.schedule('*/10 * * * *', async () => {
        console.log('🕒 Running Scheduled AttLog Sync...');
        try {
            const response = await fetch('http://localhost:3000/api/mysql/import/att-log', {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) {
                console.log(`✅ AttLog Sync Success: ${result.stats.imported} imported, ${result.stats.errors} errors.`);
            } else {
                console.error('❌ AttLog Sync Failed:', result.message);
            }
        } catch (error) {
            console.error('❌ Error during scheduled AttLog sync:', error.message);
        }
    });

    console.log('🚀 Scheduled tasks initialized.');
};
