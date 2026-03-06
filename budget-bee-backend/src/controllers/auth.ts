import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { config } from '../config/env.js';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body; // Using raw body instead of registerSchema.parse to match HEAD's db schema requirements

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                data: null,
                message: 'Email already registered',
                error: 'DUPLICATE_EMAIL'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName
            }
        });

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            },
            message: 'Registration successful'
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Registration failed',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid credentials',
                error: 'UNAUTHORIZED'
            });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid credentials',
                error: 'UNAUTHORIZED'
            });
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || config.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Login failed',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};
