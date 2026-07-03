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
            include: { category: true, account: true },
            orderBy: { date: 'desc' },
        });

        const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

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

        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        const transactions = await prisma.transaction.findMany({
            where: { userId, date: { gte: sixMonthsAgo } },
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels: string[] = [];
        const income: number[] = [];
        const expense: number[] = [];

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(monthNames[d.getMonth()]);
            income.push(0);
            expense.push(0);
        }

        transactions.forEach(t => {
            const mIndex = (now.getFullYear() - t.date.getFullYear()) * 12 + (now.getMonth() - t.date.getMonth());
            if (mIndex >= 0 && mIndex < 6) {
                const arrayIndex = 5 - mIndex;
                if (t.type === 'INCOME') {
                    income[arrayIndex] += t.amount;
                } else if (t.type === 'EXPENSE') {
                    expense[arrayIndex] += t.amount;
                }
            }
        });

        const data = { labels, income, expense };

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
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                type: 'EXPENSE',
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { category: true }
        });

        const categoryMap: Record<string, { name: string, population: number, color: string }> = {};
        
        transactions.forEach(t => {
            const catName = t.category.name;
            if (!categoryMap[catName]) {
                categoryMap[catName] = {
                    name: catName,
                    population: 0,
                    color: t.category.color || `#${Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0')}`,
                };
            }
            categoryMap[catName].population += t.amount;
        });

        const data = Object.values(categoryMap).map(d => ({
            ...d,
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        }));
        return res.json({ success: true, data, message: 'Spending chart fetched' });
    } catch (error) { next(error); }
};

export const getCompareChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    return res.json({ success: true, data: {}, message: 'Compare chart fetched' });
};
