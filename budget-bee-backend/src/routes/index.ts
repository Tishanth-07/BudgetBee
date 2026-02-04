import { Router } from 'express';
import authRoutes from './auth.js';
import transactionRoutes from './transactions.js';
import categoryRoutes from './categories.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/categories', categoryRoutes);
