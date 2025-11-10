import { z } from "zod";

export const inventorySchema = z.object({
  id: z.number(),
  productId: z.number(),
  branchId: z.number(),
  quantity: z.number(),
  size: z.string().optional(),
  minStock: z.number(),
  maxStock: z.number().optional(),
  location: z.string().optional(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
    imageUrl: z.string().optional(),
    category: z.object({
      id: z.number(),
      name: z.string()
    }).optional()
  }),
  branch: z.object({
    id: z.number(),
    name: z.string()
  })
});

export const movementSchema = z.object({
  id: z.number(),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']),
  quantity: z.number(),
  previousStock: z.number(),
  newStock: z.number(),
  reason: z.string(),
  reference: z.string().optional(),
  createdAt: z.string(),
  user: z.object({
    name: z.string()
  })
});

export const alertSchema = z.object({
  id: z.number(),
  type: z.enum(['LOW_STOCK', 'OVERSTOCK']),
  message: z.string(),
  status: z.enum(['PENDING', 'RESOLVED']),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  product: z.object({
    name: z.string()
  }),
  branch: z.object({
    name: z.string()
  }),
  user: z.object({
    name: z.string()
  })
});

export type InventoryItem = z.infer<typeof inventorySchema>;
export type Movement = z.infer<typeof movementSchema>;
export type StockAlert = z.infer<typeof alertSchema>;

export interface Product {
  id: number;
  name: string;
  sku: string;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface Branch {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}