import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const createIncomeSourceSchema = z.object({
    accountId: z.string().uuid(),
    name: z.string().min(1),
    amount: z.number().int().positive(),
    frequencyDays: z.number().int().positive(),
    nextDate: z.string().datetime(),
});

const updateIncomeSourceSchema = createIncomeSourceSchema.partial();

const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const getIncomeSources = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const sources = await prisma.incomeSource.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                account: true,
            },
        });

        return res.json({
            success: true,
            data: sources,
            message: 'Income sources fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getIncomeSources failed');
        return next(error);
    }
};

export const createIncomeSource = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = createIncomeSourceSchema.parse(req.body);

        const source = await prisma.incomeSource.create({
            data: {
                ...data,
                amount: Math.round(data.amount),
                nextDate: new Date(data.nextDate),
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            data: source,
            message: 'Income source created',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'createIncomeSource failed');
        return next(error);
    }
};

export const updateIncomeSource = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const data = updateIncomeSourceSchema.parse(req.body);

        const existing = await prisma.incomeSource.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Income source not found',
                error: 'Income source not found',
            });
        }

        const updated = await prisma.incomeSource.update({
            where: { id },
            data: {
                ...data,
                amount: data.amount !== undefined ? Math.round(data.amount) : existing.amount,
                nextDate: data.nextDate ? new Date(data.nextDate) : existing.nextDate,
            },
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Income source updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'updateIncomeSource failed');
        return next(error);
    }
};

export const deleteIncomeSource = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.incomeSource.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Income source not found',
                error: 'Income source not found',
            });
        }

        await prisma.incomeSource.delete({ where: { id } });

        return res.json({
            success: true,
            data: null,
            message: 'Income source deleted',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'deleteIncomeSource failed');
        return next(error);
    }
};

export const triggerIncomeSources = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sources = await prisma.incomeSource.findMany({
            where: {
                userId,
                isActive: true,
                nextDate: {
                    lte: today,
                },
            },
        });

        if (!sources.length) {
            return res.json({
                success: true,
                data: [],
                message: 'No income sources to trigger',
            });
        }

        const results = await prisma.$transaction(async (tx) => {
            const createdTransactions = [];

            for (const source of sources) {
                const txRecord = await tx.transaction.create({
                    data: {
                        userId,
                        accountId: source.accountId,
                        type: 'INCOME',
                        amount: source.amount,
                        categoryId: (await tx.category.findFirst({
                            where: { name: 'Others' },
                        }))!.id,
                        date: today,
                        merchant: source.name,
                    },
                });

                await tx.account.update({
                    where: { id: source.accountId },
                    data: {
                        balance: {
                            increment: source.amount,
                        },
                    },
                });

                await tx.incomeSource.update({
                    where: { id: source.id },
                    data: {
                        nextDate: new Date(source.nextDate.getTime() + source.frequencyDays * 24 * 60 * 60 * 1000),
                    },
                });

                createdTransactions.push(txRecord);
            }

            return createdTransactions;
        });

        return res.json({
            success: true,
            data: results,
            message: 'Income sources triggered',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'triggerIncomeSources failed');
        return next(error);
    }
};

