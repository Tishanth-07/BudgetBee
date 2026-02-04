import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categories.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', createCategory);

export default router;
