import { Card } from "@/components/ui/card";

interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE' | string;
  amount: number | string;
  description: string;
  createdAt: string;
  branch?: { name?: string };
}

interface FinanceTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onView?: (t: Transaction) => void;
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}

export default function FinanceTable({ transactions = [], loading = false, onView, onEdit, onDelete }: FinanceTableProps) {
  const formatMoney = (v: number | string) => {
    const num = typeof v === 'number' ? v : parseFloat(String(v || '0'));
    if (isNaN(num)) return String(v);
    return `S/. ${num.toFixed(2)}`;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transacciones</h3>
          <p className="text-sm text-gray-500 mt-1">Listado completo de movimientos financieros</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {transactions.length} registros
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sucursal</th>
              <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
              <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-500">Cargando transacciones...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">No hay transacciones registradas</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t, idx) => (
                <tr key={t.id} className="transition-colors hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-green-400' : 'bg-red-400'} mr-3`}></div>
                      <span className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{t.description || '-'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {t.branch?.name || 'Sin sucursal'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex text-sm font-medium ${
                      t.type === 'INCOME' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    } rounded-full px-3 py-1`}>
                      {t.type === 'INCOME' ? '+ ' : '- '}{formatMoney(t.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        title="Ver detalles"
                        onClick={() => onView && onView(t)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        title="Editar"
                        onClick={() => onEdit && onEdit(t)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1.5 hover:bg-blue-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        title="Eliminar"
                        onClick={() => onDelete && onDelete(t)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}