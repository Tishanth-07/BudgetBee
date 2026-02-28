import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const expenseQuerySchema = z.object({
    type: z.enum(['personal', 'household']).optional(),
    householdId: z.string().uuid().optional(),
});

const createExpenseSchema = z.object({
    groupName: z.string().min(1),
    name: z.string().min(1),
    amount: z.number().int().positive(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    logoUrl: z.string().optional(),
    householdId: z.string().uuid().optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();

const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { type, householdId } = expenseQuerySchema.parse(req.query);

        const where: any = {};
        if (type === 'personal') {
            where.userId = userId;
        } else if (type === 'household') {
            where.householdId = householdId;
        } else {
            where.OR = [{ userId }, { householdId }];
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: [{ groupName: 'asc' }, { createdAt: 'asc' }],
        });

        const groups = Object.values(
            expenses.reduce<Record<string, { groupName: string; total: number; items: typeof expenses }>>(
                (acc, expense) => {
                    const key = expense.groupName;
                    if (!acc[key]) {
                        acc[key] = { groupName: expense.groupName, total: 0, items: [] as any };
                    }
                    acc[key].items.push(expense);
                    acc[key].total += expense.amount;
                    return acc;
                },
                {}
            )
        );

        return res.json({
            success: true,
            data: groups,
            message: 'Expenses fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getExpenses failed');
        return next(error);
    }
};

export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = createExpenseSchema.parse(req.body);

        const expense = await prisma.expense.create({
            data: {
                ...data,
                amount: Math.round(data.amount),
                userId: data.householdId ? null : userId,
                householdId: data.householdId ?? null,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
        });

        return res.status(201).json({
            success: true,
            data: expense,
            message: 'Expense created',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'createExpense failed');
        return next(error);
    }
};

export const updateExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const data = updateExpenseSchema.parse(req.body);

        const existing = await prisma.expense.findFirst({
            where: {
                id,
                OR: [{ userId }, { userId: null }],
            },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Expense not found',
                error: 'Expense not found',
            });
        }

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                ...data,
                amount: data.amount !== undefined ? Math.round(data.amount) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
            },
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Expense updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'updateExpense failed');
        return next(error);
    }
};

export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.expense.findFirst({
            where: {
                id,
                OR: [{ userId }, { userId: null }],
            },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Expense not found',
                error: 'Expense not found',
            });
        }

        await prisma.expense.delete({ where: { id } });

        return res.json({
            success: true,
            data: null,
            message: 'Expense deleted',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'deleteExpense failed');
        return next(error);
    }
};

export const toggleExpensePaid = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const existing = await prisma.expense.findFirst({
            where: {
                id,
                OR: [{ userId }, { userId: null }],
            },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Expense not found',
                error: 'Expense not found',
            });
        }

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                isPaid: !existing.isPaid,
            },
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Expense payment status updated',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'toggleExpensePaid failed');
        return next(error);
    }
};

