import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const createAccountSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['BANK', 'CASH', 'CARD']),
    cardNumber: z.string().optional(),
    cardNetwork: z.string().optional(),
    cardHolder: z.string().optional(),
    expiry: z.string().optional(),
    color: z.string().optional(),
});

const updateAccountSchema = createAccountSchema.partial();

const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const getAccounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const accounts = await prisma.account.findMany({
            where: { userId, isActive: true },
            orderBy: { name: 'asc' },
        });

        return res.json({
            success: true,
            data: accounts,
            message: 'Accounts fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getAccounts failed');
        return next(error);
    }
};

export const createAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = createAccountSchema.parse(req.body);

        const account = await prisma.account.create({
            data: {
                ...data,
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            data: account,
            message: 'Account created',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'createAccount failed');
        return next(error);
    }
};

export const getAccountById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const account = await prisma.account.findFirst({
            where: { id, userId, isActive: true },
            include: {
                transactions: {
                    where: {
                        date: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                    orderBy: { date: 'desc' },
                    take: 50,
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Account not found',
                error: 'Account not found',
            });
        }

        return res.json({
            success: true,
            data: account,
            message: 'Account fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getAccountById failed');
        return next(error);
    }
};

export const updateAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const data = updateAccountSchema.parse(req.body);

        const account = await prisma.account.findFirst({
            where: { id, userId, isActive: true },
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Account not found',
                error: 'Account not found',
            });
        }

        const updated = await prisma.account.update({
            where: { id },
            data,
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Account updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'updateAccount failed');
        return next(error);
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const account = await prisma.account.findFirst({
            where: { id, userId, isActive: true },
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Account not found',
                error: 'Account not found',
            });
        }

        await prisma.account.update({
            where: { id },
            data: { isActive: false },
        });

        return res.json({
            success: true,
            data: null,
            message: 'Account deleted',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'deleteAccount failed');
        return next(error);
    }
};

export const getAccountsSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const accounts = await prisma.account.findMany({
            where: { userId, isActive: true },
        });

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        const breakdown = accounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            color: acc.color,
        }));

        return res.json({
            success: true,
            data: {
                totalBalance,
                accounts: breakdown,
            },
            message: 'Accounts summary fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getAccountsSummary failed');
        return next(error);
    }
};

