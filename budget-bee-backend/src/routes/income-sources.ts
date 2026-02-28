import { Router } from 'express';
import {
    getIncomeSources,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    triggerIncomeSources,
} from '../controllers/incomeSources.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getIncomeSources);
router.post('/', createIncomeSource);
router.put('/:id', updateIncomeSource);
router.delete('/:id', deleteIncomeSource);
router.post('/trigger', triggerIncomeSources);

export default router;

