import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';
import FinanceSummary from './FinanceSummary';
import FinanceTable from './FinanceTable';
import FinanceFilters from './FinanceFilters';
import FinanceCharts from './FinanceCharts';
import { useApi } from '@/lib/api';

interface FilterValues {
  startDate: string;
  endDate: string;
  branchId: string;
  type: 'all' | 'income' | 'expense';
}

export default function FinancePage() {
  const api = useApi();
  const [filters, setFilters] = useState<FilterValues>({
    startDate: '',
    endDate: '',
    branchId: '',
    type: 'all'
  });

  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for new transaction
  const [form, setForm] = useState({ type: 'INCOME', amount: '', description: '', branchId: '' });

  // Handlers for table actions: view, edit, delete
  const handleView = (t: any) => {
    Swal.fire({
      title: 'Detalle de transacción',
      html: `
        <p><strong>Tipo:</strong> ${t.type}</p>
        <p><strong>Monto:</strong> S/. ${Number(t.amount).toFixed(2)}</p>
        <p><strong>Descripción:</strong> ${t.description || '-'} </p>
        <p><strong>Sucursal:</strong> ${t.branch?.name || '-'}</p>
        <p><strong>Fecha:</strong> ${new Date(t.createdAt).toLocaleString()}</p>
      `,
      icon: 'info'
    });
  };

  const handleEdit = async (t: any) => {
    const html = `
      <div class="space-y-2 text-sm text-left">
        <label class="block"><span class="text-xs text-gray-600">Tipo</span>
          <select id="swal-type" class="w-full p-2 border rounded mt-1">
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>
        </label>
        <label class="block"><span class="text-xs text-gray-600">Monto</span>
          <input id="swal-amount" class="w-full p-2 border rounded mt-1" />
        </label>
        <label class="block"><span class="text-xs text-gray-600">Descripción</span>
          <input id="swal-desc" class="w-full p-2 border rounded mt-1" />
        </label>
        <label class="block"><span class="text-xs text-gray-600">Sucursal ID (opcional)</span>
          <input id="swal-branch" class="w-full p-2 border rounded mt-1" />
        </label>
      </div>
    `;

    const { value: confirmed } = await Swal.fire({
      title: 'Editar transacción',
      html,
      focusConfirm: false,
      showCancelButton: true,
      didOpen: () => {
        // prefill
        const tType = document.getElementById('swal-type') as HTMLSelectElement | null;
        const tAmt = document.getElementById('swal-amount') as HTMLInputElement | null;
        const tDesc = document.getElementById('swal-desc') as HTMLInputElement | null;
        const tBranch = document.getElementById('swal-branch') as HTMLInputElement | null;
        if (tType) tType.value = t.type;
        if (tAmt) tAmt.value = String(t.amount);
        if (tDesc) tDesc.value = t.description || '';
        if (tBranch) tBranch.value = t.branch?.id ? String(t.branch.id) : (t.branchId ? String(t.branchId) : '');
      }
    });

    if (confirmed) {
      // read values
      const tType = (document.getElementById('swal-type') as HTMLSelectElement).value;
      const tAmt = (document.getElementById('swal-amount') as HTMLInputElement).value;
      const tDesc = (document.getElementById('swal-desc') as HTMLInputElement).value;
      const tBranch = (document.getElementById('swal-branch') as HTMLInputElement).value;

      const payload: any = {
        type: tType,
        amount: parseFloat(tAmt),
        description: tDesc,
      };
      if (tBranch) payload.branchId = tBranch;

      // client validations
      if (!['INCOME', 'EXPENSE'].includes(payload.type)) {
        Swal.fire({ icon: 'error', title: 'Tipo inválido' });
        return;
      }
      if (isNaN(payload.amount) || payload.amount <= 0) {
        Swal.fire({ icon: 'error', title: 'Monto inválido' });
        return;
      }

      try {
        setLoading(true);
        await api.put(`/finances/transactions/${t.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Actualizado' });
        await load();
      } catch (err: any) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo actualizar' });
      } finally { setLoading(false); }
    }
  };

  const handleDelete = async (t: any) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar transacción',
      text: '¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;
    try {
      setLoading(true);
      await api.del(`/finances/transactions/${t.id}`);
      Swal.fire({ icon: 'success', title: 'Eliminado' });
      await load();
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo eliminar' });
    } finally { setLoading(false); }
  };

  // loader: obtiene summary y transacciones desde el backend
  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get('/finances/summary', params);
      // backend returns { summary, transactions }
      const s = res?.summary || { income: 0, expenses: 0, balance: 0 };
      setSummary(s);
      setTransactions(Array.isArray(res?.transactions) ? res.transactions : []);
    } catch (err) {
      console.error('Error cargando resumen financiero', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // recarga cuando cambian filtros
  }, [filters]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finanzas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los ingresos y gastos de tu negocio
          </p>
        </div>
        <Button
          onClick={() => {
            const el = document.getElementById('finance-form-container');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="inline-flex items-center"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nueva transacción
        </Button>
      </div>

      {/* Resumen financiero */}
  <FinanceSummary summary={summary} />

      {/* Filtros y gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <FinanceCharts summary={summary} transactions={transactions} />
        </Card>
        <Card className="p-6">
          <FinanceFilters filters={filters} onFilterChange={setFilters} />

          <div className="mt-6" id="finance-form-container">
            <h4 className="font-medium mb-3">Registrar transacción</h4>
            <form id="finance-form" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  type: form.type,
                  amount: parseFloat(form.amount),
                  description: form.description,
                  branchId: form.branchId || undefined
                };
                // Validaciones en cliente
                if (!payload.type || !['INCOME','EXPENSE'].includes(payload.type)) {
                  Swal.fire({ icon: 'error', title: 'Tipo inválido', text: 'Selecciona Ingreso o Gasto' });
                  return;
                }
                if (isNaN(payload.amount) || payload.amount <= 0) {
                  Swal.fire({ icon: 'error', title: 'Monto inválido', text: 'Ingresa un monto numérico mayor que cero' });
                  return;
                }

                setLoading(true);
                const res = await api.post('/finances/transactions', payload);
                // backend returns { message, data }
                Swal.fire({ icon: 'success', title: 'Registrado', text: res?.message || 'Transacción creada' });
                setForm({ type: 'INCOME', amount: '', description: '', branchId: '' });
                await load();
              } catch (err: any) {
                console.error(err);
                // Mostrar mensaje detallado si el servidor lo provee
                const msg = err?.message || (err?.response && err.response?.message) || 'No se pudo crear la transacción';
                Swal.fire({ icon: 'error', title: 'Error', text: msg });
              } finally { setLoading(false); }
            }} className="space-y-3 mt-2">
              <select aria-label="Tipo de transacción" title="Tipo" value={form.type} onChange={e => setForm(f=>({ ...f, type: e.target.value }))} className="w-full p-2 border rounded">
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Gasto</option>
              </select>
              <input aria-label="Monto" placeholder="Monto (S/.)" value={form.amount} onChange={e => setForm(f=>({ ...f, amount: e.target.value }))} className="w-full p-2 border rounded" />
              <input aria-label="Descripción" placeholder="Descripción" value={form.description} onChange={e => setForm(f=>({ ...f, description: e.target.value }))} className="w-full p-2 border rounded" />
              <input aria-label="Sucursal (opcional)" placeholder="Sucursal ID (opcional)" value={form.branchId} onChange={e => setForm(f=>({ ...f, branchId: e.target.value }))} className="w-full p-2 border rounded" />
              <div><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Guardando...' : 'Registrar'}</button></div>
            </form>
          </div>
  </Card>
      </div>

      {/* Tabla de transacciones */}
      <Card className="overflow-hidden">
        <FinanceTable transactions={transactions} loading={loading} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      </Card>
    </div>
  );
}

// end
