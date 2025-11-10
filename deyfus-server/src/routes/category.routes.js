import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, createCategory);

export default router;