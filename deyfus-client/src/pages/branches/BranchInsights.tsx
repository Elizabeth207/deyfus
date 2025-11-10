import { AlertTriangle, ArrowUp, ArrowDown, ShoppingBag, Users } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

interface BranchInsightsProps {
  id: number;
  stats: {
    salesByDay: number[];
    stockAlerts: number;
    topProducts: Array<{ name: string; sales: number }>;
    staffActivity: Array<{ name: string; sales: number }>;
  };
}

export default function BranchInsights({ id, stats }: BranchInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Stock Alerts Panel */}
      {stats.stockAlerts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle size={20} className="text-amber-500" />
            <div>
              <h4 className="font-medium">Alertas de Stock</h4>
              <p className="text-sm text-amber-700 mt-0.5">
                Hay {stats.stockAlerts} productos que requieren atención
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
        <h4 className="font-medium text-slate-800">Ventas últimos 7 días</h4>
        <Bar 
          data={{
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
              label: 'Ventas',
              data: stats.salesByDay,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-500" />
              <h4 className="font-medium text-slate-800">Productos más vendidos</h4>
            </div>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <span className="text-sm text-slate-600">{product.name}</span>
                <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  {product.sales} ventas
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-indigo-500" />
              <h4 className="font-medium text-slate-800">Rendimiento del equipo</h4>
            </div>
          </div>
          <div className="space-y-3">
            {stats.staffActivity.map((staff, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <span className="text-sm text-slate-600">{staff.name}</span>
                <span className="text-sm font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                  {staff.sales} transacciones
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}