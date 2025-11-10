import { Router } from 'express';
import { createTransaction, getFinancialSummary, updateTransaction, deleteTransaction } from '../controllers/finance.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/transactions', authMiddleware, createTransaction);
router.get('/summary', authMiddleware, getFinancialSummary);
router.put('/transactions/:id', authMiddleware, updateTransaction);
router.delete('/transactions/:id', authMiddleware, deleteTransaction);

export default router;