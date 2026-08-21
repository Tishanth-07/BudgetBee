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
    priorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    logoUrl: z.string().optional(),
    householdId: z.string().uuid().optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();

const payExpenseSchema = z.object({
    accountId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
});

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = Object.values(
            expenses.reduce<Record<string, { groupName: string; total: number; items: (typeof expenses[0] & { daysUntilDue: number | null })[] }>>(
                (acc, expense) => {
                    const key = expense.groupName;
                    if (!acc[key]) {
                        acc[key] = { groupName: expense.groupName, total: 0, items: [] };
                    }
                    
                    let daysUntilDue = null;
                    if (expense.dueDate) {
                        const dueDate = new Date(expense.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    }

                    acc[key].items.push({ ...expense, daysUntilDue });
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
                OR: [
                    { userId },
                    { household: { members: { some: { userId } } } }
                ],
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
                OR: [
                    { userId },
                    { household: { members: { some: { userId } } } }
                ],
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

export const payExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const { accountId, categoryId } = payExpenseSchema.parse(req.body);

        const existing = await prisma.expense.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    { household: { members: { some: { userId } } } }
                ],
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
        
        if (existing.isPaid) {
            return res.status(400).json({ success: false, data: null, message: 'Expense is already paid' });
        }

        let finalCategoryId = categoryId;
        if (!finalCategoryId) {
            let othersCategory = await prisma.category.findFirst({
                where: { userId, type: 'EXPENSE', name: 'Others' }
            });
            if (!othersCategory) {
                othersCategory = await prisma.category.create({
                    data: { userId, name: 'Others', type: 'EXPENSE', icon: 'dots', color: '#9CA3AF' }
                });
            }
            finalCategoryId = othersCategory.id;
        }

        const updated = await prisma.$transaction(async (tx) => {
            const expense = await tx.expense.update({
                where: { id },
                data: { isPaid: true },
            });

            await tx.transaction.create({
                data: {
                    amount: expense.amount,
                    type: 'EXPENSE',
                    categoryId: finalCategoryId,
                    accountId,
                    userId,
                    householdId: expense.householdId,
                    date: new Date(),
                    merchant: expense.name,
                    note: `Payment for ${expense.name} (${expense.groupName})`
                }
            });

            await tx.account.update({
                where: { id: accountId },
                data: { balance: { decrement: expense.amount } }
            });

            return expense;
        });

        return res.json({
            success: true,
            data: updated,
            message: 'Expense paid successfully',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'payExpense failed');
        return next(error);
    }
};

