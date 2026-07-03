import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const transactionSchema = z.object({
    amount: z.number().int().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string(),
    accountId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    merchant: z.string().optional(),
    note: z.string().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { category: true, account: true },
        });
        res.json({ success: true, data: transactions, message: 'Fetched' });
    } catch (error) { next(error); }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = transactionSchema.parse(req.body);

        const transaction = await prisma.$transaction(async (tx) => {
            const created = await tx.transaction.create({
                data: { ...data, userId },
                include: { category: true, account: true }
            });

            // Update Account Balance Atomically
            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: data.type === 'INCOME' 
                        ? { increment: data.amount }
                        : { decrement: data.amount }
                }
            });
            return created;
        });
        res.status(201).json({ success: true, data: transaction, message: 'Created' });
    } catch (error) { next(error); }
};

export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const transaction = await prisma.transaction.findFirst({
            where: { id, userId },
            include: { category: true, account: true },
        });
        if (!transaction) return res.status(404).json({ success: false, data: null, message: 'Not found' });
        res.json({ success: true, data: transaction, message: 'Fetched' });
    } catch (error) { next(error); }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const data = transactionSchema.partial().parse(req.body);

        const existing = await prisma.transaction.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ success: false, data: null, message: 'Not found' });

        const transaction = await prisma.$transaction(async (tx) => {
            // Revert old balance Atomically
            await tx.account.update({
                where: { id: existing.accountId },
                data: {
                    balance: existing.type === 'INCOME'
                        ? { decrement: existing.amount }
                        : { increment: existing.amount }
                }
            });

            const updated = await tx.transaction.update({
                where: { id },
                data,
                include: { category: true, account: true }
            });

            // Apply new balance Atomically
            await tx.account.update({
                where: { id: updated.accountId },
                data: {
                    balance: updated.type === 'INCOME'
                        ? { increment: updated.amount }
                        : { decrement: updated.amount }
                }
            });
            return updated;
        });

        res.json({ success: true, data: transaction, message: 'Updated' });
    } catch (error) { next(error); }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.transaction.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ success: false, data: null, message: 'Not found' });

        await prisma.$transaction(async (tx) => {
            // Revert old balance Atomically
            await tx.account.update({
                where: { id: existing.accountId },
                data: {
                    balance: existing.type === 'INCOME'
                        ? { decrement: existing.amount }
                        : { increment: existing.amount }
                }
            });
            await tx.transaction.delete({ where: { id } });
        });

        res.json({ success: true, data: null, message: 'Deleted' });
    } catch (error) { next(error); }
};
