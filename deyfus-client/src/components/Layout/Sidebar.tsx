import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaStore,
  FaCog,
  FaSignOutAlt,
  FaWarehouse,
} from 'react-icons/fa';
import { GiRunningShoe } from 'react-icons/gi';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = (user?.role || '').toString().toUpperCase();

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'SELLER':
        return 'Vendedor';
      default:
        return r;
    }
  };

  return (
  <aside className="w-72 min-h-screen bg-gradient-to-b from-white/60 via-white to-white/60 rounded-2xl p-6 pb-12 shadow-xl flex flex-col">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
          <GiRunningShoe size={26} />
        </div>
        <div>
          <div className="font-extrabold text-2xl text-slate-800">Deyfus</div>
          <div className="text-sm font-medium text-slate-500">{user?.name}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 py-2">
        {[
          { to: '/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
          { to: '/dashboard/users', label: 'Usuarios', icon: <FaUsers /> },
          { to: '/dashboard/products', label: 'Productos', icon: <FaBox /> },
          { to: '/dashboard/sales', label: 'Ventas', icon: <FaShoppingCart /> },
          { to: '/dashboard/finance', label: 'Finanzas', icon: <FaChartLine /> },
          { to: '/dashboard/branches', label: 'Sucursales', icon: <FaStore /> },
          { to: '/dashboard/inventory', label: 'Inventario', icon: <FaWarehouse /> },
          { to: '/dashboard/settings', label: 'Configuración', icon: <FaCog /> },
        ].map((item) => (
          <NavLink to={item.to} key={item.to} className={() => `group block` }>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md -translate-x-0.5' : 'text-slate-700 hover:bg-slate-100 hover:translate-x-0.5'}`}>
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-white'} `}>
                  {/* Render icon with explicit color depending on active state */}
                  {React.createElement((item.icon as any).type || item.icon, { className: `text-lg ${isActive ? 'text-white' : 'text-slate-800'}` })}
                </span>
                <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

  <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
            {user?.name ? String(user.name).split(' ').map((x: string) => x[0]).slice(0,2).join('') : 'U'}
          </div>
          <div className="flex-1">
            <div className="font-medium text-slate-800">{user?.name || 'Usuario'}</div>
            <div className="text-sm text-slate-500">{getRoleLabel(role)}</div>
          </div>
        </div>

        <div className="mt-2">
        <button
          onClick={async () => {
            const result = await Swal.fire({
              title: 'Cerrar sesión',
              text: `¿Deseas cerrar sesión como ${user?.name ?? 'usuario'}?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, cerrar sesión',
              cancelButtonText: 'No, cancelar',
              reverseButtons: true,
              customClass: {
                popup: 'rounded-xl',
              },
            });
            if (result.isConfirmed) {
              await Swal.fire({
                icon: 'success',
                title: 'Cerrando sesión',
                timer: 700,
                showConfirmButton: false,
              });
              logout();
            }
          }}
          className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-600 rounded-lg hover:from-rose-100 hover:to-rose-200 transition-colors duration-150 shadow-sm"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
        </div>
      </div>
    </aside>
  );
}
