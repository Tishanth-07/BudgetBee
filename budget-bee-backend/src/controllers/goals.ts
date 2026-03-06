import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const createGoalSchema = z.object({
    name: z.string().min(1),
    targetAmount: z.number().int().positive(),
    savedAmount: z.number().int().nonnegative().optional(),
    householdId: z.string().uuid().optional(),
    deadline: z.string().datetime().optional(),
});

const updateGoalSchema = createGoalSchema.partial().extend({
    addAmount: z.number().int().positive().optional(),
});

const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const getGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        return res.json({
            success: true,
            data: goals,
            message: 'Goals fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getGoals failed');
        return next(error);
    }
};

export const createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = createGoalSchema.parse(req.body);

        const goal = await prisma.goal.create({
            data: {
                userId,
                householdId: data.householdId ?? null,
                name: data.name,
                targetAmount: Math.round(data.targetAmount),
                savedAmount: data.savedAmount !== undefined ? Math.round(data.savedAmount) : 0,
                deadline: data.deadline ? new Date(data.deadline) : null,
            },
        });

        return res.status(201).json({
            success: true,
            data: goal,
            message: 'Goal created',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'createGoal failed');
        return next(error);
    }
};

export const updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const data = updateGoalSchema.parse(req.body);

        const existing = await prisma.goal.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Goal not found',
                error: 'Goal not found',
            });
        }

        let savedAmount = existing.savedAmount;
        if (data.addAmount !== undefined) {
            savedAmount += Math.round(data.addAmount);
        } else if (data.savedAmount !== undefined) {
            savedAmount = Math.round(data.savedAmount);
        }

        const updated = await prisma.goal.update({
            where: { id },
            data: {
                name: data.name ?? existing.name,
                targetAmount:
                    data.targetAmount !== undefined ? Math.round(data.targetAmount) : existing.targetAmount,
                savedAmount,
                deadline: data.deadline ? new Date(data.deadline) : existing.deadline,
            },
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Goal updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'updateGoal failed');
        return next(error);
    }
};

export const deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.goal.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Goal not found',
                error: 'Goal not found',
            });
        }

        await prisma.goal.delete({ where: { id } });

        return res.json({
            success: true,
            data: null,
            message: 'Goal deleted',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'deleteGoal failed');
        return next(error);
    }
};

export const markGoalPaid = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.goal.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Goal not found',
                error: 'Goal not found',
            });
        }

        const updated = await prisma.goal.update({
            where: { id },
            data: {
                isPaid: !existing.isPaid,
            },
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Goal payment status updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'markGoalPaid failed');
        return next(error);
    }
};

