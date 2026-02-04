import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const transactionSchema = z.object({
    amount: z.number(),
    type: z.enum(['income', 'expense']),
    categoryId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    note: z.string().optional(),
});

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { category: true },
        });
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = transactionSchema.parse(req.body);

        const transaction = await prisma.transaction.create({
            data: { ...data, userId },
        });
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};
