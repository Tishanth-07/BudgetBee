import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

const setCacheHeader = (res: Response) => {
    res.setHeader('Cache-Control', 'max-age=60');
};

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

        const [accounts, incomeAgg, expenseAgg] = await Promise.all([
            prisma.account.findMany({
                where: { userId, isActive: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'INCOME',
                    date: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
        ]);

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const accountBreakdown = accounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            color: acc.color,
        }));

        const earningsThisMonth = incomeAgg._sum.amount ?? 0;
        const spentThisMonth = expenseAgg._sum.amount ?? 0;

        setCacheHeader(res);
        return res.json({
            success: true,
            data: {
                totalBalance,
                earningsThisMonth,
                spentThisMonth,
                accountBreakdown,
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
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            orderBy: { date: 'asc' },
        });

        const dailyMap = new Map<string, number>();
        let runningBalance = 0;

        for (const tx of transactions) {
            const d = new Date(tx.date);
            const key = d.toISOString().slice(0, 10);

            const change = tx.type === 'INCOME' ? tx.amount : -tx.amount;
            runningBalance += change;
            dailyMap.set(key, runningBalance);
        }

        const data = Array.from(dailyMap.entries()).map(([date, balance]) => ({
            date,
            balance,
        }));

        setCacheHeader(res);
        return res.json({
            success: true,
            data,
            message: 'Monthly balance chart fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getMonthlyChart failed');
        return next(error);
    }
};

export const getAccountsChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const accounts = await prisma.account.findMany({
            where: { userId, isActive: true },
        });

        const data = accounts.map((acc) => ({
            name: acc.name,
            balance: acc.balance,
            type: acc.type,
            color: acc.color,
        }));

        setCacheHeader(res);
        return res.json({
            success: true,
            data,
            message: 'Accounts chart data fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getAccountsChart failed');
        return next(error);
    }
};

export const getSpendingChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const rows = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: 'EXPENSE',
            },
            _sum: { amount: true },
        });

        const categoryIds = rows.map((r) => r.categoryId);
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        const total = rows.reduce((sum, r) => sum + (r._sum.amount ?? 0), 0);

        const data = rows.map((row) => {
            const category = categories.find((c) => c.id === row.categoryId)!;
            const amount = row._sum.amount ?? 0;
            const percentage = total > 0 ? (amount / total) * 100 : 0;

            return {
                categoryName: category.name,
                total: amount,
                percentage,
                color: category.color,
            };
        });

        setCacheHeader(res);
        return res.json({
            success: true,
            data,
            message: 'Spending chart data fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getSpendingChart failed');
        return next(error);
    }
};

export const getCompareChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const yearsParam = (req.query.years as string | undefined) ?? '';
        const years = yearsParam
            .split(',')
            .map((y) => y.trim())
            .filter(Boolean)
            .map((y) => parseInt(y, 10))
            .filter((y) => !Number.isNaN(y));

        if (!years.length) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'years query parameter is required',
                error: 'years query parameter is required',
            });
        }

        const results: Array<{
            year: number;
            dailyTotals: { date: string; expense: number }[];
        }> = [];

        for (const year of years) {
            const start = new Date(Date.UTC(year, 0, 1));
            const end = new Date(Date.UTC(year + 1, 0, 1));

            const transactions = await prisma.transaction.findMany({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: {
                        gte: start,
                        lt: end,
                    },
                },
                orderBy: { date: 'asc' },
            });

            const dailyMap = new Map<string, number>();

            for (const tx of transactions) {
                const d = new Date(tx.date);
                const key = d.toISOString().slice(0, 10);
                dailyMap.set(key, (dailyMap.get(key) ?? 0) + tx.amount);
            }

            const dailyTotals = Array.from(dailyMap.entries()).map(([date, expense]) => ({
                date,
                expense,
            }));

            results.push({
                year,
                dailyTotals,
            });
        }

        setCacheHeader(res);
        return res.json({
            success: true,
            data: results,
            message: 'Dashboard compare chart data fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getCompareChart failed');
        return next(error);
    }
};

