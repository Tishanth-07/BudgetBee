import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../config/env.js';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, firstName, lastName } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash, firstName, lastName },
        });

        const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        next(error);
    }
};
