import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const incomeSourceSchema = z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    frequency: z.enum(['Monthly', 'Weekly', 'Bi-weekly', 'Annually']),
});

const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const getIncomeSources = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const incomeSources = await prisma.incomeSource.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({
            success: true,
            data: incomeSources,
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
        const data = incomeSourceSchema.parse(req.body);

        const incomeSource = await prisma.incomeSource.create({
            data: {
                ...data,
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            data: incomeSource,
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
        const data = incomeSourceSchema.partial().parse(req.body);

        const existing = await prisma.incomeSource.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Income source not found',
                error: 'NOT_FOUND',
            });
        }

        const updated = await prisma.incomeSource.update({
            where: { id },
            data,
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
                error: 'NOT_FOUND',
            });
        }

        await prisma.incomeSource.delete({
            where: { id },
        });

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
    // Left as a placeholder for cron/scheduled jobs triggering logic if needed in the future
    return res.json({
        success: true,
        data: null,
        message: 'Trigger not implemented for simple income sources',
    });
};
