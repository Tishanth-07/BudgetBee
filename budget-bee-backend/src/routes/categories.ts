import { Router } from 'express';
import { getCategories } from '../controllers/categories.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);

export default router;
