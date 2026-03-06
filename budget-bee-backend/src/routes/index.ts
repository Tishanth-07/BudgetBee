import { Router } from 'express';
import authRoutes from './auth.js';
import transactionRoutes from './transactions.js';
import categoryRoutes from './categories.js';
import accountRoutes from './accounts.js';
import dashboardRoutes from './dashboard.js';
import incomeRoutes from './income-sources.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/accounts', accountRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/income', incomeRoutes);
