import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'MANAGER':
      return 'Gerente';
    case 'SELLER':
      return 'Vendedor';
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-700';
    case 'MANAGER':
      return 'bg-blue-100 text-blue-700';
    case 'SELLER':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function DashboardLayout() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 p-4">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <header className="mb-8 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                      Bienvenido, {user?.name}
                    </h1>
                    <span className={`px-3 py-1 ${getRoleColor(user?.role || '')} rounded-full text-sm font-medium`}>
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Sucursal: {user?.branchId || 'Principal'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[calc(100vh-13rem)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
