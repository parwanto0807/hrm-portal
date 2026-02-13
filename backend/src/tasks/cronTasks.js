
import cron from 'node-cron';
import fetch from 'node-fetch';
import { prisma } from '../config/prisma.js';

export const initCronTasks = () => {
    // 1. Schedule AttLog Sync every 10 minutes
    // This calls our own internal API to perform the sync
    cron.schedule('0 1,10,18 * * *', async () => {

        try {
            const response = await fetch('http://localhost:5002/api/mysql/import/att-log', {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) {

            } else {
                console.error('❌ AttLog Sync Failed:', result.message);
            }
        } catch (error) {
            console.error('❌ Error during scheduled AttLog sync:', error.message);
        }
    });

    // 2. Schedule Log Cleanup every day at midnight (00:00)
    // Deletes logs older than 7 days
    cron.schedule('0 0 * * *', async () => {

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const result = await prisma.sysEventHistory.deleteMany({
                where: {
                    datetime: {
                        lt: sevenDaysAgo
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error during scheduled log cleanup:', error.message);
        }
    });


};
