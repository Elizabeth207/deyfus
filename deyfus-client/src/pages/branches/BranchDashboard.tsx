import { AlertCircle, Package, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BranchDashboardProps {
  id: number;
  stats: {
    sales: {
      total: number;
      change: number;
    };
    products: {
      total: number;
      lowStock: number;
    };
    staff: {
      total: number;
      active: number;
    };
    alerts: {
      total: number;
      critical: number;
    };
  };
}

export default function BranchDashboard({ id, stats }: BranchDashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ventas */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Ventas</p>
            <h4 className="text-white text-2xl font-bold mt-1">
              ${stats.sales.total.toLocaleString()}
            </h4>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium 
            ${stats.sales.change >= 0 
              ? 'bg-blue-400/20 text-blue-50' 
              : 'bg-blue-900/20 text-blue-50'}`}>
            {stats.sales.change >= 0 ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            <span>{Math.abs(stats.sales.change)}%</span>
          </div>
        </div>
        <div className="mt-3 text-blue-100 text-xs">
          vs. mes anterior
        </div>
      </div>

      {/* Productos */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Productos</p>
            <h4 className="text-white text-2xl font-bold mt-1">
              {stats.products.total}
            </h4>
          </div>
          <div className="bg-white/20 p-2 rounded-xl">
            <Package className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-3 text-emerald-100 text-xs flex items-center gap-1">
          <AlertCircle size={12} />
          {stats.products.lowStock} con stock bajo
        </div>
      </div>

      {/* Personal */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 shadow-lg shadow-violet-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-violet-100 text-sm">Personal</p>
            <h4 className="text-white text-2xl font-bold mt-1">
              {stats.staff.total}
            </h4>
          </div>
          <div className="bg-white/20 p-2 rounded-xl">
            <User className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-3 text-violet-100 text-xs">
          {stats.staff.active} activos hoy
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 shadow-lg shadow-rose-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-rose-100 text-sm">Alertas</p>
            <h4 className="text-white text-2xl font-bold mt-1">
              {stats.alerts.total}
            </h4>
          </div>
          <div className="bg-white/20 p-2 rounded-xl">
            <AlertCircle className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-3 text-rose-100 text-xs">
          {stats.alerts.critical} alertas críticas
        </div>
      </div>
    </div>
  );
}