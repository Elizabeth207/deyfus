import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate, schemas } from '../utils/validation.js';

const router = Router();

// Aplicar validación de request bodies para evitar inconsistencias y payloads mal formados
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);

export default router;