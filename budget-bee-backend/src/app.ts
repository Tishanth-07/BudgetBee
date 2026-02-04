import express, { Express } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import { routes } from './routes/index.js';
import { errorHandler } from './middleware/error.js';

export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);
