import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getDashboardData);

export default router;