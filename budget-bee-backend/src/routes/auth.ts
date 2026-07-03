import { Router } from 'express';
import { register, login, refreshToken, verifyEmail, forgotPassword, resetPassword, resendCode } from '../controllers/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
