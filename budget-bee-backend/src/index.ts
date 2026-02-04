import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const start = async () => {
    try {
        app.listen(config.PORT, () => {
            logger.info(`🚀 Server running on port ${config.PORT}`);
        });
    } catch (error) {
        logger.error(error, 'Error starting server');
        process.exit(1);
    }
};

start();
