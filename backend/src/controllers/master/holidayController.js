
import { prisma } from '../../config/prisma.js';
import fetch from 'node-fetch';

/**
 * Get Holidays
 * @route GET /api/holidays
 */
export const getHolidays = async (req, res) => {
    try {
        const { year } = req.query;
        
        const where = {};
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            where.tanggal = {
                gte: startDate,
                lte: endDate
            };
        }

        const holidays = await prisma.holiday.findMany({
            where,
            orderBy: { tanggal: 'asc' }
        });

        res.json({ success: true, data: holidays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Holiday
 * @route POST /api/holidays
 */
export const createHoliday = async (req, res) => {
    try {
        const { tanggal, keterangan, typeDay, isRepeat } = req.body;

        const holiday = await prisma.holiday.create({
            data: {
                tanggal: new Date(tanggal),
                keterangan,
                typeDay: typeDay || 'LIBUR_NASIONAL',
                isRepeat: isRepeat ?? false
            }
        });

        res.status(201).json({ success: true, data: holiday });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Holiday
 * @route PUT /api/holidays/:id
 */
export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { tanggal, keterangan, typeDay, isRepeat } = req.body;

        const holiday = await prisma.holiday.update({
            where: { id },
            data: {
                tanggal: tanggal ? new Date(tanggal) : undefined,
                keterangan,
                typeDay,
                isRepeat
            }
        });

        res.json({ success: true, data: holiday });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Holiday
 * @route DELETE /api/holidays/:id
 */
export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.holiday.delete({ where: { id } });
        res.json({ success: true, message: 'Holiday deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Sync Holidays from External API
 * @route POST /api/holidays/sync
 */
export const syncHolidays = async (req, res) => {
    try {
        const { year } = req.body;
        const targetYear = year || new Date().getFullYear();

        console.log(`🔄 Syncing holidays for year ${targetYear}...`);

        // Use a more reliable API source (Day.js / Nager.Date fallback)
        // Original: https://api-harilibur.vercel.app/api?year=${targetYear} (Often Rate Limited/Down)
        // New: https://dayoffapi.vercel.app/api?year=${targetYear} (Alternative)
        // Backup: https://date.nager.at/api/v3/PublicHolidays/${targetYear}/ID

        let data = [];
        let source = 'primary';

        try {
            // Try Primary Source (Specialized for Indonesia, includes Cuti Bersama)
            const response = await fetch(`https://dayoffapi.vercel.app/api?year=${targetYear}`);
            const text = await response.text();
            
            try {
                data = JSON.parse(text);
                // Map dayoffapi format to our standard format
                data = data.map(item => ({
                    holiday_date: item.tanggal,
                    holiday_name: item.keterangan,
                    is_cuti_bersama: item.is_cuti
                }));
            } catch (e) {
                console.warn('Primary API returned non-JSON:', text.substring(0, 100));
                throw new Error('Invalid JSON from Primary API');
            }
        } catch (primaryError) {
            console.warn('Primary API failed, trying backup...', primaryError.message);
            source = 'backup';
            
            // Try Backup Source (Nager.Date - Global, stable, but might miss Cuti Bersama)
            const backupResponse = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${targetYear}/ID`);
             const text = await backupResponse.text();
            
            try {
                const backupData = JSON.parse(text);
                // Map Nager.Date format to our expected format
                data = backupData.map(item => ({
                    holiday_date: item.date,
                    holiday_name: item.localName,
                    is_national_holiday: true,
                    is_cuti_bersama: false // Nager mostly tracks public holidays
                }));
            } catch (e) {
                 console.error('Backup API returned non-JSON:', text.substring(0, 100));
                 throw new Error('Both APIs failed. Please try again later or input manually.');
            }
        }

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid response data format');
        }

        let syncedCount = 0;

        for (const item of data) {
            // Determine Type
            let typeDay = 'LIBUR_NASIONAL';
            if (item.is_cuti_bersama) {
                typeDay = 'CUTI_BERSAMA';
            }

            // Only process valid dates
            const holidayDate = new Date(item.holiday_date);
            if (isNaN(holidayDate.getTime())) continue;

            // Upsert based on Date
            await prisma.holiday.upsert({
                where: { tanggal: holidayDate },
                update: {
                    keterangan: item.holiday_name ? item.holiday_name.substring(0, 40) : null,
                    typeDay: typeDay,
                    isRepeat: false
                },
                create: {
                    tanggal: holidayDate,
                    keterangan: item.holiday_name ? item.holiday_name.substring(0, 40) : null,
                    typeDay: typeDay,
                    isRepeat: false
                }
            });
            syncedCount++;
        }

        res.json({ 
            success: true, 
            message: `Successfully synced ${syncedCount} holidays for ${targetYear} (Source: ${source})`,
            count: syncedCount 
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
