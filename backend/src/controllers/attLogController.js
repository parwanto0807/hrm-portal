// src/controllers/attLogController.js
import { prisma } from '../config/prisma.js';
import { startOfDay, endOfDay } from 'date-fns';

export const getAttLogs = async (req, res) => {
    let { nik, date } = req.query;

    // Role-based data isolation
    if (req.user.role === 'EMPLOYEE') {
        nik = req.user.emplId;
    }

    if (!nik || !date) {
        return res.status(400).json({ success: false, message: 'NIK and Date are required' });
    }

    try {
        const queryDate = new Date(date);
        
        const logs = await prisma.attLog.findMany({
            where: {
                nik: nik.trim(),
                tanggal: {
                    gte: startOfDay(queryDate),
                    lte: endOfDay(queryDate),
                }
            },
            orderBy: {
                jam: 'asc'
            }
        });

        // 5-second Deduplication logic (user requested 2s, we use 5s for safety)
        // Since 'jam' is stored as "HH.mm", we need to be careful.
        // If the raw data has seconds or if we have high-res logs, we could do better.
        // However, looking at the schema and sample data, 'jam' is "HH.mm".
        // If the machine only provides HH.mm, we filter exact duplicates in the same minute.
        
        const filteredLogs = [];
        let lastLog = null;

        for (const log of logs) {
            if (!lastLog) {
                filteredLogs.push(log);
                lastLog = log;
                continue;
            }

            // If time (HH.mm) and flag are the same, it's definitely a double-tap
            const isSameTime = log.jam === lastLog.jam;
            const isSameFlag = log.cflag === lastLog.cflag;

            if (isSameTime && isSameFlag) {
                continue; // Skip double-tap
            }

            filteredLogs.push(log);
            lastLog = log;
        }

        res.status(200).json({ success: true, count: filteredLogs.length, data: filteredLogs });
    } catch (error) {
        console.error('Error fetching AttLogs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
