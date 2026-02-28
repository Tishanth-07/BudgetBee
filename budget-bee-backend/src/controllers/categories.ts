import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

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
