import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1),
    type: z.enum(['INCOME', 'EXPENSE']),
    color: z.string().optional(),
    icon: z.string().optional(),
});

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const categories = await prisma.category.findMany({
            where: { userId },
        });
        res.json({ success: true, data: categories, message: 'Categories fetched' });
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
        res.status(201).json({ success: true, data: category, message: 'Category created' });
    } catch (error) {
        next(error);
    }
};

