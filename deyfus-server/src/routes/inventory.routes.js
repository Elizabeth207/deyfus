import { Router } from 'express';
import { 
  getInventory, 
  createInventory, 
  updateInventory, 
  deleteInventory,
  adjustStock,
  getMovements 
} from '../controllers/inventory.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas principales de inventario
router.get('/list', authMiddleware, getInventory);
router.post('/create', authMiddleware, createInventory);
router.put('/update/:id', authMiddleware, updateInventory);
router.delete('/delete/:id', authMiddleware, deleteInventory);

// Rutas para ajustes y movimientos
router.post('/adjust/:id', authMiddleware, adjustStock);
router.get('/movements/:id', authMiddleware, getMovements);

export default router;