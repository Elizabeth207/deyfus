import { useEffect, useState, useMemo } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts';

// Tipos
interface DashboardData {
  dailySales: {
    total: number;
    count: number;
    sales: any[];
  };
  weeklySales: {
    total: number;
    count: number;
    sales: any[];
  };
  lowStockProducts: any[];
  financialSummary: {
    income: number;
    expenses: number;
    balance: number;
  };
  salesByBranch: any[];
  topProducts: any[];
  recentSales: any[];
  productsByCategory: any[];
  stockAlerts: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function SmallSparkline({ dataKey, data }: { dataKey: string; data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 40, minWidth: 80 }} className="rounded bg-white/5" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Area type="monotone" dataKey={dataKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.15} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function DashboardPage() {
  const { get } = useApi();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await get('/api/dashboard');
        if (!mounted) return;
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [get]);
  // Datos para sparkline en KPIs (últimos 7 días)
  const sparkData = useMemo(() => {
    const map = new Map<string, number>();
    (data?.weeklySales?.sales ?? []).forEach(s => {
      const d = format(new Date(s.createdAt), 'dd/MM');
      map.set(d, (map.get(d) || 0) + Number(s.total));
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [data]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Cargando dashboard...</div>
    </div>
  );

  // Mostrar errores de carga
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">Error cargando dashboard: {error}</div>
      <div className="mt-4">
        <button onClick={() => { setError(null); setLoading(true); (async () => { try { const res = await get('/api/dashboard'); setData(res); } catch (e: any) { setError(String(e?.message || e)); } finally { setLoading(false); } })(); }} className="px-4 py-2 bg-blue-600 text-white rounded">Reintentar</button>
      </div>
    </div>
  );

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

  // Preparar datos para las gráficas
  const weeklySalesArr = data?.weeklySales?.sales ?? [];
  const salesData = weeklySalesArr.map(sale => ({
    date: format(new Date(sale.createdAt), 'EEE', { locale: es }),
    total: Number(sale.total)
  }));

  

  const categoryData = (data?.productsByCategory ?? []).map(cat => ({
    name: cat.name,
    count: (cat.products ?? []).length
  }));

  const topProducts = data?.topProducts ?? [];
  const stockAlerts = data?.stockAlerts ?? [];
  const recentSales = data?.recentSales ?? [];
  const salesByBranch = data?.salesByBranch ?? [];

  // Extract simple scalars with safe defaults
  const dailyTotal = data?.dailySales?.total ?? 0;
  const dailyCount = data?.dailySales?.count ?? 0;
  const weeklyTotal = data?.weeklySales?.total ?? 0;
  const weeklyCount = data?.weeklySales?.count ?? 0;
  const financial = {
    income: data?.financialSummary?.income ?? 0,
    expenses: data?.financialSummary?.expenses ?? 0,
    balance: data?.financialSummary?.balance ?? 0
  };
  const lowStockCount = (data?.lowStockProducts ?? []).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header + KPIs principales con estilo moderno */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Panel de Control · Deyfus</h1>
          <p className="text-sm text-gray-500">Vista general rápida de ventas, inventario y finanzas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Rango: 7 Oct - 7 Nov 2025</div>
          <button onClick={() => window.location.reload()} className="px-3 py-1 bg-white border rounded shadow hover:bg-gray-50">Refrescar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase opacity-90">Ventas del día</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(dailyTotal)}</div>
          <div className="text-sm opacity-90">{dailyCount} ventas</div>
          <div className="mt-3"><SmallSparkline dataKey="total" data={sparkData} /></div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase opacity-90">Ventas de la semana</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(weeklyTotal)}</div>
          <div className="text-sm opacity-90">{weeklyCount} ventas</div>
          <div className="mt-3"><SmallSparkline dataKey="total" data={sparkData} /></div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500">Balance</div>
              <div className={`text-2xl font-bold ${financial.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(financial.balance)}</div>
              <div className="text-sm text-gray-500">Ingresos {formatCurrency(financial.income)} · Gastos {formatCurrency(financial.expenses)}</div>
            </div>
            <div className="w-28 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Income', value: financial.income }, { name: 'Expenses', value: financial.expenses }]} dataKey="value" innerRadius={20} outerRadius={30}>
                    <Cell key="cell-0" fill="#00C49F" />
                    <Cell key="cell-1" fill="#FF8042" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <div className="text-xs text-gray-500">Alertas de stock</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{stockAlerts.length}</div>
          <div className="text-sm text-gray-500">{lowStockCount} productos bajos</div>
        </div>
      </div>

      {/* Gráficas y datos detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de ventas */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Ventas de la semana</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                  name="Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de categorías */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Productos por categoría</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top productos vendidos */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-3">Top productos vendidos</h3>
          {topProducts.length === 0 ? (
            <div className="text-gray-500">No hay datos de ventas</div>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((item: any, index: number) => (
                <li key={item.productId} className="flex items-center gap-3 p-3 border rounded">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Producto {item.productId}</div>
                    <div className="text-sm text-gray-500">{item._sum.quantity} unidades vendidas</div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(Number(item._sum.price))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Alertas de stock */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-3">Alertas de stock</h3>
          {stockAlerts.length === 0 ? (
            <div className="text-gray-500">No hay alertas pendientes</div>
          ) : (
            <ul className="space-y-3">
              {stockAlerts.map((alert: any) => (
                <li key={alert.id} className="p-3 border rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{alert.product.name}</div>
                      <div className="text-sm text-gray-500">
                        {alert.branch.name} · {alert.message}
                      </div>
                    </div>
                    <div className="text-amber-600 font-medium">
                      {format(new Date(alert.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ventas recientes */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-3">Ventas recientes</h3>
          {recentSales.length === 0 ? (
            <div className="text-gray-500">No hay ventas recientes</div>
          ) : (
            <ul className="space-y-3">
              {recentSales.map((sale: any) => (
                <li key={sale.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Venta {sale.id}</div>
                      <div className="text-sm text-gray-500">
                        {sale.user.name} · {sale.branch.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    <div className="font-semibold">{formatCurrency(Number(sale.total))}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ventas por sucursal (solo para admin/manager) */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && salesByBranch.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">Ventas por sucursal</h3>
            <ul className="space-y-3">
              {salesByBranch.map((branchSale: any) => (
                <li key={branchSale.branchId} className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                      <div>
                      <div className="font-medium">Sucursal {branchSale.branchId}</div>
                      <div className="text-sm text-gray-500">{branchSale._count} ventas</div>
                    </div>
                    <div className="font-semibold">{formatCurrency(Number(branchSale._sum.total))}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
 

