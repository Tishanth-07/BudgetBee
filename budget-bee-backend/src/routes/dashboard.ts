import { Router } from 'express';
import {
    getSummary,
    getMonthlyChart,
    getAccountsChart,
    getSpendingChart,
    getCompareChart,
} from '../controllers/dashboard.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/charts/monthly', getMonthlyChart);
router.get('/charts/accounts', getAccountsChart);
router.get('/charts/spending', getSpendingChart);
router.get('/charts/compare', getCompareChart);

export default router;

