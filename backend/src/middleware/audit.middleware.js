
import { sysLog } from '../utils/logger.js';

/**
 * Middleware to automatically audit POST, PUT, and DELETE requests
 */
export const auditLog = async (req, res, next) => {
    // Only log mutations
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        // Skip logging for specific paths if needed (e.g., login itself is handled manually)
        if (req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/refresh')) {
            return next();
        }

        // Catch the original end method
        const originalEnd = res.end;

        res.end = function(chunk, encoding) {
            res.end = originalEnd;
            res.end(chunk, encoding);

            // Only log if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logData = {
                    logUser: req.user?.username || req.user?.email || 'system',
                    modul: req.originalUrl.split('/')[2]?.toUpperCase() || 'UNKNOWN',
                    action: req.method,
                    data: {
                        path: req.originalUrl,
                        body: req.body,
                        query: req.query,
                        params: req.params
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                };

                // async log without awaiting to not block response (even though we're already at res.end)
                sysLog(logData);
            }
        };
    }
    
    next();
};
