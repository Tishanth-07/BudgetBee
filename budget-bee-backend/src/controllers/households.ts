import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const createHouseholdSchema = z.object({
    name: z.string().min(1),
});

const addMemberSchema = z.object({
    email: z.string().email(),
});

const idParamSchema = z.object({
    id: z.string().uuid(),
});

const memberIdParamSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
});

export const getHouseholds = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const households = await prisma.household.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        return res.json({
            success: true,
            data: households,
            message: 'Households fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getHouseholds failed');
        return next(error);
    }
};

export const createHousehold = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = createHouseholdSchema.parse(req.body);

        const household = await prisma.household.create({
            data: {
                name: data.name,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return res.status(201).json({
            success: true,
            data: household,
            message: 'Household created',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'createHousehold failed');
        return next(error);
    }
};

export const getHouseholdById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const household = await prisma.household.findFirst({
            where: {
                id,
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Household not found',
                error: 'Household not found',
            });
        }

        return res.json({
            success: true,
            data: household,
            message: 'Household fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getHouseholdById failed');
        return next(error);
    }
};

export const addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);
        const { email } = addMemberSchema.parse(req.body);

        const household = await prisma.household.findFirst({
            where: { id, members: { some: { userId } } },
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Household not found',
                error: 'Household not found',
            });
        }

        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'User to add not found',
                error: 'User to add not found',
            });
        }

        const membership = await prisma.householdMember.upsert({
            where: {
                householdId_userId: {
                    householdId: id,
                    userId: userToAdd.id,
                },
            },
            update: {},
            create: {
                householdId: id,
                userId: userToAdd.id,
                role: 'MEMBER',
            },
        });

        return res.json({
            success: true,
            data: membership,
            message: 'Member added to household',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'addMember failed');
        return next(error);
    }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id, userId: memberUserId } = memberIdParamSchema.parse(req.params);

        const household = await prisma.household.findFirst({
            where: { id, members: { some: { userId } } },
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Household not found',
                error: 'Household not found',
            });
        }

        await prisma.householdMember.deleteMany({
            where: {
                householdId: id,
                userId: memberUserId,
            },
        });

        return res.json({
            success: true,
            data: null,
            message: 'Member removed from household',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'removeMember failed');
        return next(error);
    }
};

export const getHouseholdTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const household = await prisma.household.findFirst({
            where: { id, members: { some: { userId } } },
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Household not found',
                error: 'Household not found',
            });
        }

        const transactions = await prisma.transaction.findMany({
            where: { householdId: id },
            orderBy: { date: 'desc' },
            include: {
                category: true,
                account: true,
            },
        });

        return res.json({
            success: true,
            data: transactions,
            message: 'Household transactions fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getHouseholdTransactions failed');
        return next(error);
    }
};

export const getHouseholdExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = idParamSchema.parse(req.params);

        const household = await prisma.household.findFirst({
            where: { id, members: { some: { userId } } },
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Household not found',
                error: 'Household not found',
            });
        }

        const expenses = await prisma.expense.findMany({
            where: { householdId: id },
            orderBy: [{ groupName: 'asc' }, { createdAt: 'asc' }],
        });

        return res.json({
            success: true,
            data: expenses,
            message: 'Household expenses fetched',
        });
    } catch (error) {
        logger.error({ error, userId: req.user?.id }, 'getHouseholdExpenses failed');
        return next(error);
    }
};

