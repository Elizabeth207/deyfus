import { Router } from 'express';
import { createBranch, getBranches, updateBranch, deleteBranch } from '../controllers/branch.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', authMiddleware, createBranch);
router.get('/', authMiddleware, getBranches);
router.put('/:id', authMiddleware, updateBranch);
router.delete('/:id', authMiddleware, deleteBranch);
export default router;