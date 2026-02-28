import { Router } from 'express';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    markGoalPaid,
} from '../controllers/goals.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/pay', markGoalPaid);

export default router;

