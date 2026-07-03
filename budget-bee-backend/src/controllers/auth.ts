import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { config } from '../config/env.js';
import crypto from 'crypto';

const MAX_DEVICES = 5;

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

async function manageRefreshTokens(userId: string, newHashedToken: string, oldHashedToken?: string) {
    if (oldHashedToken) {
        await prisma.refreshToken.deleteMany({ where: { hashedToken: oldHashedToken } });
    }
    
    const activeTokens = await prisma.refreshToken.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    
    if (activeTokens.length >= MAX_DEVICES) {
        const tokensToDelete = activeTokens.slice(MAX_DEVICES - 1).map((t: any) => t.id);
        await prisma.refreshToken.deleteMany({ where: { id: { in: tokensToDelete } } });
    }
    
    await prisma.refreshToken.create({
        data: {
            hashedToken: newHashedToken,
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });
}


const passwordValidation = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol');

const registerSchema = z.object({
    email: z.string().email().transform(v => v.trim().toLowerCase()),
    password: passwordValidation,
    firstName: z.string().min(1, 'First name is required').transform(v => v.trim()),
    lastName: z.string().min(1, 'Last name is required').transform(v => v.trim()),
});

const loginSchema = z.object({
    email: z.string().email().transform(v => v.trim().toLowerCase()),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                message: parseResult.error.issues[0].message,
                error: 'VALIDATION_ERROR'
            });
        }
        const { email, password, firstName, lastName } = parseResult.data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // If user exists and is already verified, block duplicate registration
            if (existingUser.isVerified) {
                return res.status(409).json({
                    success: false,
                    data: null,
                    message: 'Email already registered',
                    error: 'DUPLICATE_EMAIL'
                });
            }

            // User exists but is NOT verified — resend a new verification code
            await prisma.verificationCode.deleteMany({ where: { email, type: 'REGISTER' } });

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.verificationCode.create({
                data: {
                    email,
                    code,
                    type: 'REGISTER',
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
                }
            });

            const { sendEmail, getVerificationEmailHtml } = await import('../utils/email.js');
            const emailSent = await sendEmail(
                email,
                'Verify Your BudgetBee Account',
                `Your verification code is: ${code}`,
                getVerificationEmailHtml(code)
            );

            if (!emailSent) {
                console.error('Failed to send verification email to:', email);
                return res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to send verification email. Please try again.',
                    error: 'EMAIL_SEND_FAILED'
                });
            }

            return res.status(200).json({
                success: true,
                data: null,
                message: 'A new verification code has been sent to your email.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Create user with isVerified: false
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                isVerified: false
            }
        });

        // Generate and save verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        await prisma.verificationCode.create({
            data: {
                email,
                code,
                type: 'REGISTER',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
            }
        });

        // Send email
        const { sendEmail, getVerificationEmailHtml } = await import('../utils/email.js');
        const emailSent = await sendEmail(
            email, 
            'Verify Your BudgetBee Account', 
            `Your verification code is: ${code}`,
            getVerificationEmailHtml(code)
        );

        if (!emailSent) {
            console.error('Failed to send verification email to:', email);
            return res.status(500).json({
                success: false,
                data: null,
                message: 'Account created but failed to send verification email. Please try registering again.',
                error: 'EMAIL_SEND_FAILED'
            });
        }

        return res.status(201).json({
            success: true,
            data: null, // No tokens provided yet
            message: 'Registration initiated. Please check your email for the verification code.'
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

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                data: null,
                message: 'Please verify your email address before logging in.',
                error: 'UNVERIFIED_EMAIL'
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
        const refreshToken = generateRefreshToken();
        const hashedRefreshToken = hashToken(refreshToken);
        await manageRefreshTokens(user.id, hashedRefreshToken);

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

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Refresh token required',
                error: 'BAD_REQUEST'
            });
        }

        const hashedOldToken = hashToken(refreshToken);
        const record = await prisma.refreshToken.findUnique({
            where: { hashedToken: hashedOldToken },
            include: { user: true }
        });

        if (!record || record.revoked || record.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid or expired refresh token',
                error: 'UNAUTHORIZED'
            });
        }

        const user = record.user;

        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const newRefreshToken = generateRefreshToken();
        const newHashedToken = hashToken(newRefreshToken);
        await manageRefreshTokens(user.id, newHashedToken, hashedOldToken);

        return res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
            message: 'Token refreshed',
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            data: null,
            message: 'Invalid or expired refresh token',
            error: 'UNAUTHORIZED'
        });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        
        const record = await prisma.verificationCode.findFirst({
            where: { email, code, type: 'REGISTER' },
            orderBy: { createdAt: 'desc' }
        });

        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
        }

        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true }
        });

        await prisma.verificationCode.deleteMany({ where: { email, type: 'REGISTER' } });

        const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || config.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = generateRefreshToken();
        await manageRefreshTokens(user.id, hashToken(refreshToken));

        return res.json({
            success: true,
            data: { accessToken, refreshToken, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } },
            message: 'Email verified successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Verification failed.' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.json({ success: true, message: 'If an account exists, a reset code was sent.' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.verificationCode.create({
            data: { email, code, type: 'RESET_PASSWORD', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
        });

        const { sendEmail, getResetPasswordEmailHtml } = await import('../utils/email.js');
        await sendEmail(
            email, 
            'Reset Your BudgetBee Password', 
            `Your password reset code is: ${code}`,
            getResetPasswordEmailHtml(code)
        );

        return res.json({ success: true, message: 'If an account exists, a reset code was sent.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to request reset.' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const parseResult = passwordValidation.safeParse(req.body.newPassword);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                message: parseResult.error.issues[0].message
            });
        }
        const { email, code, newPassword } = req.body;
        const record = await prisma.verificationCode.findFirst({
            where: { email, code, type: 'RESET_PASSWORD' },
            orderBy: { createdAt: 'desc' }
        });

        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { email }, data: { passwordHash } });
        await prisma.verificationCode.deleteMany({ where: { email, type: 'RESET_PASSWORD' } });

        return res.json({ success: true, message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Reset failed.' });
    }
};

export const resendCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.isVerified) {
            // Don't reveal whether the account exists or is already verified
            return res.json({ success: true, message: 'If an unverified account exists, a new code was sent.' });
        }

        // Delete old codes and create a new one
        await prisma.verificationCode.deleteMany({ where: { email, type: 'REGISTER' } });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.verificationCode.create({
            data: {
                email,
                code,
                type: 'REGISTER',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
            }
        });

        const { sendEmail, getVerificationEmailHtml } = await import('../utils/email.js');
        const emailSent = await sendEmail(
            email,
            'Verify Your BudgetBee Account',
            `Your verification code is: ${code}`,
            getVerificationEmailHtml(code)
        );

        if (!emailSent) {
            console.error('Failed to resend verification email to:', email);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.',
                error: 'EMAIL_SEND_FAILED'
            });
        }

        return res.json({ success: true, message: 'A new verification code has been sent to your email.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to resend code.' });
    }
};
