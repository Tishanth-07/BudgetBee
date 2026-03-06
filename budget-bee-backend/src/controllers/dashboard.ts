import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
        });

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return res.json({
            success: true,
            data: {
                totalBalance,
                income,
                expense,
                recentTransactions: transactions.slice(0, 5),
            },
            message: 'Dashboard summary fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getSummary failed');
        return next(error);
    }
};

export const getMonthlyChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        // Return placeholder structure for chart data for 6 months
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            income: [Math.random() * 50000, Math.random() * 50000, Math.random() * 50000, Math.random() * 50000, Math.random() * 50000, Math.random() * 50000],
            expense: [Math.random() * 40000, Math.random() * 40000, Math.random() * 40000, Math.random() * 40000, Math.random() * 40000, Math.random() * 40000],
        };

        return res.json({
            success: true,
            data,
            message: 'Monthly chart fetched',
        });
    } catch (error) { next(error); }
};

export const getAccountsChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });
        const data = accounts.map(a => ({
            name: a.name,
            population: a.balance,
            color: a.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        }));

        return res.json({ success: true, data, message: 'Accounts chart fetched' });
    } catch (error) { next(error); }
};

export const getSpendingChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        // Mocking for frontend
        const data = [
            { name: 'Food', population: 15000, color: '#f87171', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: 'Transport', population: 5000, color: '#60a5fa', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: 'Shopping', population: 12000, color: '#34d399', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        ];
        return res.json({ success: true, data, message: 'Spending chart fetched' });
    } catch (error) { next(error); }
};

export const getCompareChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    return res.json({ success: true, data: {}, message: 'Compare chart fetched' });
};
