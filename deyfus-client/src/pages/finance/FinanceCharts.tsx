import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface FinanceChartsProps {
  summary?: { income: number; expenses: number; balance: number };
  transactions?: any[];
}

function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}

function buildSeries(transactions: any[]) {
  // group by month-year
  const map = new Map<string, { income: number; expenses: number; date: Date }>();
  transactions.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = map.get(key) || { income: 0, expenses: 0, date: d };
    if (t.type === 'INCOME') entry.income += Number(t.amount || 0);
    else entry.expenses += Number(t.amount || 0);
    map.set(key, entry);
  });

  // sort by date
  const arr = Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  arr.sort((a, b) => a.date.getTime() - b.date.getTime());

  // build recharts data
  return arr.map(a => ({ name: monthLabel(a.date), income: Number(a.income.toFixed(2)), expenses: Number(a.expenses.toFixed(2)) }));
}

export default function FinanceCharts({ summary = { income: 0, expenses: 0, balance: 0 }, transactions = [] }: FinanceChartsProps) {
  const data = transactions && transactions.length ? buildSeries(transactions) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen mensual</h3>
          <p className="text-sm text-gray-500 mt-1">Análisis de ingresos y gastos</p>
        </div>
        <select 
          aria-label="Periodo" 
          className="text-sm bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option>Últimos 30 días</option>
          <option>Últimos 60 días</option>
          <option>Últimos 90 días</option>
        </select>
      </div>

      <Card className="p-6 bg-white rounded-xl shadow-sm">
        {data.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No hay datos para mostrar</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `S/. ${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => `S/. ${Number(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '1rem'
                  }}
                />
                <Bar 
                  dataKey="income" 
                  name="Ingresos" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Gastos" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Ingresos</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900">S/. {Number(summary.income).toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  {transactions.filter(t => t.type === 'INCOME').length} transacciones
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500 rounded-xl">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Gastos</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900">S/. {Number(summary.expenses).toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-red-600">
                  {transactions.filter(t => t.type === 'EXPENSE').length} transacciones
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}