/**
 * Convert time string "HH:mm" to total minutes from start of day
 * @param {string} timeStr - Time string in "HH:mm" format
 * @returns {number|null} - Total minutes or null if invalid
 */
export const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    return (hours * 60) + minutes;
};

/**
 * Calculate lateness in minutes
 * @param {string} stdIn - Scheduled check-in "HH:mm"
 * @param {string} realIn - Actual check-in "HH:mm"
 * @returns {number} - Lateness in minutes (0 if on time or before)
 */
export const calculateLate = (stdIn, realIn) => {
    const stdMin = timeToMinutes(stdIn);
    const realMin = timeToMinutes(realIn);
    
    if (stdMin === null || realMin === null) return 0;
    
    const diff = realMin - stdMin;
    return diff > 0 ? diff : 0;
};

/**
 * Calculate early departure in minutes
 * @param {string} stdOut - Scheduled check-out "HH:mm"
 * @param {string} realOut - Actual check-out "HH:mm"
 * @returns {number} - Early departure in minutes (0 if on time or after)
 */
export const calculateEarly = (stdOut, realOut) => {
    const stdMin = timeToMinutes(stdOut);
    const realMin = timeToMinutes(realOut);
    
    if (stdMin === null || realMin === null) return 0;
    
    const diff = stdMin - realMin;
    return diff > 0 ? diff : 0;
};

/**
 * Sanitize attendance status based on clock-in/out times
 * @param {object} data - Attendance record data
 * @returns {string} - Sanitized status code
 */
export const sanitizeAttendanceStatus = (data) => {
    const hasClockIn = !!data.realMasuk && data.realMasuk !== '--:--' && data.realMasuk.trim() !== '';
    const hasClockOut = !!data.realKeluar && data.realKeluar !== '--:--' && data.realKeluar.trim() !== '';
    
    // If status is "Hadir" (H) but no clock in AND no clock out, it's potentially an invalid 'Hadir' status
    // We change it to 'A' (Alpha/Absent) if no clock data exists at all
    if (data.kdAbsen === 'H' && !hasClockIn && !hasClockOut) {
        return 'A'; // Mark as Alpha if no clock data
    }
    
    // If it has at least one clock event, we can keep it as 'H' (Hadir) or 
    // maybe we want a "Partial" status, but for now 'H' is fine if there's any activity.
    
    return data.kdAbsen;
};
