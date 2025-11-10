import { Card } from "@/components/ui/card";

interface SummaryProps {
  summary?: {
    income?: number;
    expenses?: number;
    balance?: number;
  };
}

function formatMoney(v?: number) {
  if (v === undefined || v === null) return 'S/. 0.00';
  return `S/. ${Number(v).toFixed(2)}`;
}

export default function FinanceSummary({ summary = { income: 0, expenses: 0, balance: 0 } }: SummaryProps) {
  const income = summary.income ?? 0;
  const expenses = summary.expenses ?? 0;
  const balance = summary.balance ?? (income - expenses);

  const margin = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Ingresos totales */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50"></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-xl shadow-lg transform transition-transform hover:scale-110">
              <svg
                className="h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Ingresos totales</h3>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatMoney(income)}</p>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${income > 0 ? (income / (income + expenses) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">
                    {income > 0 ? `${margin}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gastos totales */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-50"></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-red-500 rounded-xl shadow-lg transform transition-transform hover:scale-110">
              <svg
                className="h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Gastos totales</h3>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatMoney(expenses)}</p>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${expenses > 0 ? (expenses / (income + expenses) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-red-600">
                    {expenses > 0 ? `${((expenses / income) * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Balance */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-xl shadow-lg transform transition-transform hover:scale-110">
              <svg
                className="h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Balance</h3>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatMoney(balance)}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {balance >= 0 ? '↑' : '↓'} {Math.abs(Number(margin))}% margen
                  </span>
                  <span className="text-sm text-gray-500">del total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}