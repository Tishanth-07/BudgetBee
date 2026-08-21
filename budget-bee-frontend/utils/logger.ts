/**
 * Custom Logger Utility
 * Provides a structured way to log messages instead of using console.log directly.
 */

export const logger = {
    info: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[INFO] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        // We might want to send this to a crash reporting tool in production
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};
