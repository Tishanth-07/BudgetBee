import { Router } from 'express';
import {
    getHouseholds,
    createHousehold,
    getHouseholdById,
    addMember,
    removeMember,
    getHouseholdTransactions,
    getHouseholdExpenses,
} from '../controllers/households.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getHouseholds);
router.post('/', createHousehold);
router.get('/:id', getHouseholdById);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/transactions', getHouseholdTransactions);
router.get('/:id/expenses', getHouseholdExpenses);

export default router;

