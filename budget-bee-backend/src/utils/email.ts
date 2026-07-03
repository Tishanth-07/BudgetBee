import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"BudgetBee" <${config.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const generateOTP = (length: number = 6): string => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

const baseEmailTemplate = (title: string, message: string, code: string, actionText: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #2563eb; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 40px 32px; text-align: center; }
        .title { color: #111827; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; }
        .message { color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px; }
        .code-container { background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin: 0 auto 32px; max-width: 300px; }
        .code { color: #1e3a8a; font-size: 40px; font-weight: 800; letter-spacing: 12px; margin: 0; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 14px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BudgetBee</h1>
        </div>
        <div class="content">
            <h2 class="title">${title}</h2>
            <p class="message">${message}</p>
            <div class="code-container">
                <p class="code">${code}</p>
            </div>
            <p class="message" style="font-size: 14px; color: #6b7280;">${actionText}</p>
        </div>
        <div class="footer">
            <p>If you didn't request this email, you can safely ignore it.</p>
            <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} BudgetBee. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const getVerificationEmailHtml = (code: string) => {
    return baseEmailTemplate(
        'Verify your email address',
        'Thanks for joining BudgetBee! Please use the following 6-digit code to verify your email address and complete your registration.',
        code,
        'This code will expire in 15 minutes.'
    );
};

export const getResetPasswordEmailHtml = (code: string) => {
    return baseEmailTemplate(
        'Reset your password',
        'We received a request to reset your password. Please use the following 6-digit code to choose a new password.',
        code,
        'This code will expire in 15 minutes.'
    );
};

