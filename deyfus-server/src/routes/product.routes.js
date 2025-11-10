import { Router } from 'express';
import { 
  getProducts, 
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateInventory
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getProducts);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.post('/:id/inventory', authMiddleware, updateInventory);

export default router;