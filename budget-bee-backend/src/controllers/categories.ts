import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1),
    type: z.enum(['income', 'expense']),
    color: z.string().optional(),
    emoji: z.string().optional(),
});

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const categories = await prisma.category.findMany({
            where: { userId },
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = categorySchema.parse(req.body);

        const category = await prisma.category.create({
            data: { ...data, userId },
        });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};
