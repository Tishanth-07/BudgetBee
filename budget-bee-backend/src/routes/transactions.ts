import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactions.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
