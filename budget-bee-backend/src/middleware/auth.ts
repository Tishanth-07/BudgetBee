import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../utils/prisma.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        const payload = jwt.verify(token, config.JWT_SECRET) as { userId: string };

        // Optional: check if user still exists
        // const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        // if (!user) throw new Error('User not found');

        req.user = { id: payload.userId };
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
