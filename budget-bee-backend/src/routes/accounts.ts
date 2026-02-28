import { Router } from 'express';
import {
    getAccounts,
    createAccount,
    getAccountById,
    updateAccount,
    deleteAccount,
    getAccountsSummary,
} from '../controllers/accounts.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAccounts);
router.post('/', createAccount);
router.get('/summary', getAccountsSummary);
router.get('/:id', getAccountById);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;

