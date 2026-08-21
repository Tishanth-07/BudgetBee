import { Router } from 'express';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    payExpense,
} from '../controllers/expenses.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.patch('/:id/pay', payExpense);

export default router;

