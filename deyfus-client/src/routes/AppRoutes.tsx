import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import SalesIndexPage from '@/pages/sales';
import SalesTable from '@/pages/sales/SalesTable';
import POS from '@/pages/sales/pos';
import SaleDetail from '@/pages/sales/SaleDetail';

import DashboardPage from '@/pages/dashboard';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductsPage from '@/pages/products';
import ProductForm from '@/pages/products/ProductForm';
import ProductDetail from '@/pages/products/ProductDetail';
import InventoryPage from '@/pages/inventory';
import CreateInventoryPage from '@/pages/inventory/create';
import BranchesPage from '@/pages/branches';
import CategoriesPage from '@/pages/categories';
import FinancePage from '@/pages/finance';
import SettingsPage from '@/pages/settings';
import UsersPage from '@/pages/users';

export function AppRoutes() {

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Rutas protegidas bajo /dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route index element={<DashboardPage />} />
  <Route path="sales">
    <Route index element={<SalesIndexPage />} />
    <Route path="list" element={<SalesTable />} />
    <Route path="pos" element={<POS />} />
    <Route path=":id" element={<SaleDetail />} />
  </Route>
  <Route path="products">
    <Route index element={<ProductsPage />} />
    <Route path="new" element={<ProductForm />} />
    <Route path=":id" element={<ProductDetail />} />
    <Route path=":id/edit" element={<ProductForm />} />
  </Route>
  <Route path="inventory">
    <Route index element={<InventoryPage />} />
    <Route path="new" element={<CreateInventoryPage />} />
  </Route>
  <Route path="categories" element={<CategoriesPage />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="branches" element={<BranchesPage />} />
  <Route path="finance" element={<FinancePage />} />
  <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Redirigir a login por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Ruta 404 - No encontrado */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}