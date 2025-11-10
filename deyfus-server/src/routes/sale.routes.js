import { Router } from 'express';
import { createSale, getSales, getSaleById, cancelSale, updateSale } from '../controllers/sale.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
// Support both '/' and '/list' for listing sales because some frontend bundles
// or older code may request `/api/sales/list`. Keep both routes pointing to
// the same controller for compatibility.
router.get('/list', authMiddleware, getSales);
// Get sale by id
router.get('/:id', authMiddleware, getSaleById);
// Cancel sale
router.post('/:id/cancel', authMiddleware, cancelSale);
// Update sale (limited fields)
router.put('/:id', authMiddleware, updateSale);
// Default list and create
router.get('/', authMiddleware, getSales);
router.post('/', authMiddleware, createSale);

export default router;