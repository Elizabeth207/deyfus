// Type literals
export type UserRole = 'ADMIN' | 'MANAGER' | 'SELLER';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type SaleStatus = 'COMPLETED' | 'CANCELLED' | 'PENDING';
export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
export type FinancialType = 'INCOME' | 'EXPENSE';

// Interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  branchId: number;
  branch?: Branch;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  brand?: string;
  imageUrl?: string;
  qrCode: string;
  categoryId?: number;
  category?: Category;
  branchId?: number;
  branch?: Branch;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  inventory?: Inventory[];
  stock?: number; // Stock total disponible
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  userId: number;
  user?: User;
  branchId: number;
  branch?: Branch;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  invoiceNumber?: string;
  notes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  items: SaleItem[];
  transactions?: FinancialTransaction[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  cost: number;
  discount: number;
  size?: string;
  createdAt: string;
}

export interface Inventory {
  id: number;
  productId: number;
  product: Product;
  branchId: number;
  branch: Branch;
  quantity: number;
  size?: string;
  minStock: number;
  maxStock?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: number;
  productId: number;
  product: Product;
  branchId: number;
  branch: Branch;
  userId: number;
  user: User;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: number;
  type: FinancialType;
  amount: number;
  description: string;
  branchId: number;
  branch: Branch;
  userId: number;
  user: User;
  category: string;
  reference?: string;
  saleId?: number;
  sale?: Sale;
  createdAt: string;
  updatedAt: string;
}