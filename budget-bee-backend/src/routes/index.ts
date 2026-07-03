import { Router } from 'express';
import authRoutes from './auth.js';
import transactionRoutes from './transactions.js';
import categoryRoutes from './categories.js';
import accountRoutes from './accounts.js';
import dashboardRoutes from './dashboard.js';
import incomeRoutes from './income-sources.js';
import householdRoutes from './households.js';
import goalRoutes from './goals.js';
import expenseRoutes from './expenses.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/accounts', accountRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/income', incomeRoutes);
routes.use('/households', householdRoutes);
routes.use('/goals', goalRoutes);
routes.use('/expenses', expenseRoutes);
