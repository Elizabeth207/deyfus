import { z } from 'zod';

// NOTE: Este archivo adapta las validaciones al esquema Prisma usado en el proyecto.
// Muchos IDs en la base de datos son Int (autoincrement) — por eso usamos numbers aquí.

// Schemas de validación para los requests
export const schemas = {
  // Auth
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  }),

  // Alinear valores de role con los enums de Prisma (ADMIN, MANAGER, SELLER)
  register: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['ADMIN', 'MANAGER', 'SELLER']).optional(),
    branchId: z.number().int().optional()
  }),

  // Products (usar Int para ids, no UUID)
  createProduct: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    price: z.number().positive('El precio debe ser positivo'),
    cost: z.number().positive('El costo debe ser positivo'),
    barcode: z.string().optional(),
    categoryId: z.number().int().optional(),
    branchId: z.number().int().optional(),
    sizes: z.array(z.string()).optional()
  }),

  // Sales
  createSale: z.object({
    branchId: z.number().int('ID de sucursal inválido'),
    customerName: z.string().min(2, 'Nombre de cliente requerido'),
    items: z.array(z.object({
      productId: z.number().int('ID de producto inválido'),
      size: z.string().optional(),
      quantity: z.number().positive('La cantidad debe ser positiva'),
      unitPrice: z.number().positive('El precio unitario debe ser positivo')
    })).min(1, 'La venta debe tener al menos un item'),
    paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
    paidAmount: z.number().positive('El monto pagado debe ser positivo')
  }),

  // Inventory
  updateInventory: z.object({
    productId: z.number().int('ID de producto inválido'),
    branchId: z.number().int('ID de sucursal inválido'),
    size: z.string().optional(),
    delta: z.number().int('La cantidad debe ser un número entero'),
    note: z.string().optional()
  })
};

// Middleware de validación
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const data = await schema.parseAsync(req.body);
      req.validatedData = data;
      next();
    } catch (error) {
      next({
        name: 'ValidationError',
        errors: error?.errors || error?.issues || error
      });
    }
  };
};