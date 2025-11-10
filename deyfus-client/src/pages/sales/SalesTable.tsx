import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import type { Sale } from "@/lib/types";

function displayStatusLabel(status: string) {
  // Map backend status codes to Spanish labels.
  switch (status) {
    case "COMPLETED":
      return "Completado";
    case "CANCELLED":
      // El usuario pidió que 'Cancelado' pase a mostrarse como 'Completado'
      return "Completado";
    case "PENDING":
      return "Pendiente";
    default:
      return status;
  }
}

export default function SalesTable() {
  const api = useApi();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Sale | null>(null);
  const [viewingStocks, setViewingStocks] = useState<Record<string, number>>({});
  const [stocksSummary, setStocksSummary] = useState<Record<number, { name: string; qty: number }>>({});
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [date, setDate] = useState("");

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line
  }, [status, payment, date]);

  // Load current stock levels for items when opening the view modal
  useEffect(() => {
    if (!viewing || !viewing.items || viewing.items.length === 0) {
      setViewingStocks({});
      return;
    }
    (async () => {
      try {
        const entries = viewing.items as any[];
        const map: Record<string, number> = {};
        await Promise.all(entries.map(async (it) => {
          try {
            const res = await api.get('/inventory/list', { productId: it.productId, size: it.size });
            const data = Array.isArray(res) ? res : (res && res.data) ? res.data : [];
            const first = (data && data.length > 0) ? data[0] : null;
            const qty = first ? (first.quantity ?? first.stock ?? 0) : 0;
            const key = `${it.productId}:${it.size || ''}`;
            map[key] = qty;
          } catch (err) {
            console.error('Error cargando stock para item', it, err);
          }
        }));
        setViewingStocks(map);
      } catch (err) {
        console.error('Error cargando stocks', err);
        setViewingStocks({});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewing]);

  async function loadSales() {
    setLoading(true);
    const params: any = {};
    if (status !== "ALL") params.status = status;
    if (payment !== "ALL") params.paymentMethod = payment;
    if (date) params.startDate = params.endDate = date;
    try {
      const res = await api.get("/sales", params);
      // backend returns an array of sales directly; api.get may return either
      // an array or an object with { data: [...] } depending on helper wrappers.
      const data = Array.isArray(res) ? res : (res && res.data) ? res.data : [];
      setSales(data || []);
      // after loading sales, fetch stock summary for products involved
      loadStocksForSales(data || []);
    } catch (e) {
      console.error('Error cargando ventas', e);
      setSales([]);
    }
    setLoading(false);
  }

  async function loadStocksForSales(salesList: Sale[]) {
    try {
      const prodMap = new Map<number, string>();
      salesList.forEach(s => {
        (s.items || []).forEach((it: any) => {
          if (it.productId) prodMap.set(it.productId, it.product?.name || prodMap.get(it.productId) || '');
        });
      });
      const out: Record<number, { name: string; qty: number }> = {};
      const entries = Array.from(prodMap.entries()).slice(0, 20); // limit to 20 products to avoid too many requests
      await Promise.all(entries.map(async ([productId, name]) => {
        try {
          const res = await api.get('/inventory/list', { productId });
          const data = Array.isArray(res) ? res : (res && res.data) ? res.data : [];
          const qty = (data || []).reduce((acc: number, cur: any) => acc + (Number(cur.quantity ?? cur.stock ?? 0) || 0), 0);
          out[productId] = { name: name || `${productId}`, qty };
        } catch (err) {
          console.error('Error cargando stock para productId', productId, err);
          out[productId] = { name: name || `${productId}`, qty: 0 };
        }
      }));
      setStocksSummary(out);
    } catch (err) {
      console.error('Error en loadStocksForSales', err);
      setStocksSummary({});
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
  <select aria-label="Filtrar por estado" title="Filtrar por estado" value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="ALL">Estado</option>
          <option value="COMPLETED">Completadas</option>
          <option value="CANCELLED">Canceladas</option>
          <option value="PENDING">Pendientes</option>
        </select>
  <input aria-label="Filtrar por fecha" title="Filtrar por fecha" type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
  <select aria-label="Filtrar por método de pago" title="Filtrar por método de pago" value={payment} onChange={e => setPayment(e.target.value)} className="border rounded px-2 py-1">
          <option value="ALL">Pago</option>
          <option value="CASH">Efectivo</option>
          <option value="CARD">Tarjeta</option>
          <option value="TRANSFER">Transferencia</option>
        </select>
        <Button variant="outline" onClick={() => { setStatus("ALL"); setPayment("ALL"); setDate(""); }}>Limpiar</Button>
      </div>
      {/* Stock summary cards above the table */}
      {Object.keys(stocksSummary).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Stock (resumen de productos en esta vista)</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(stocksSummary).map(([pid, info]) => (
              <div key={pid} className="flex items-center gap-3 bg-white border rounded-md px-3 py-2 shadow-sm">
                <div className="text-sm font-medium">{info.name}</div>
                <div className="ml-2 text-xs text-gray-500">Disponible</div>
                <div className="ml-1 inline-flex items-center justify-center px-2 py-1 bg-indigo-50 text-indigo-800 rounded-full text-sm font-semibold">{info.qty}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : sales.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No hay ventas</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm bg-white divide-y divide-gray-100">
            <thead>
              <tr className="bg-indigo-100">
                <th className="px-4 py-2">Factura</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Vendedor</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Pago</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="hover:bg-indigo-50">
                  <td className="px-4 py-2">{sale.invoiceNumber || `${sale.id}`}</td>
                  <td className="px-4 py-2">{sale.items?.length || 0}</td>
                  <td className="px-4 py-2">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{sale.user?.name || "-"}</td>
                  <td className="px-4 py-2">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-2">{sale.paymentMethod === 'CASH' ? 'Efectivo' : sale.paymentMethod === 'CARD' ? 'Tarjeta' : sale.paymentMethod}</td>
                  <td className="px-4 py-2">
                    <Badge className={sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>{displayStatusLabel(sale.status)}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setViewing(sale); setViewOpen(true); }} title="Ver" aria-label={`Ver venta ${sale.id}`} className="bg-white hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>

                      <Button size="sm" variant="ghost" onClick={() => { setEditing(sale); setEditOpen(true); }} title="Editar" aria-label={`Editar venta ${sale.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>

                      <Button size="sm" variant="ghost" onClick={async () => {
                        // Acción: marcar la venta como COMPLETED
                        const result = await Swal.fire({
                          title: '¿Marcar como completada?',
                          text: 'Esta acción marcará la venta como completada.',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonText: 'Sí, completar',
                          cancelButtonText: 'No',
                          customClass: { popup: 'swal2-modal' }
                        });
                        if (!result.isConfirmed) return;
                        try {
                          await api.put(`/sales/${sale.id}`, { status: 'COMPLETED' });
                          Swal.fire({ icon: 'success', title: 'Venta completada', timer: 1400, showConfirmButton: false });
                          loadSales();
                        } catch (err) {
                          console.error('Error marcando venta como completada', err);
                          Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Error al actualizar' });
                        }
                      }} title="Completar" aria-label={`Completar venta ${sale.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Editar Venta</DialogTitle>
            <DialogDescription>Modifica el método de pago o el estado de la venta.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fm = new FormData(form);
              const paymentMethod = fm.get('paymentMethod');
              const status = fm.get('status');
              try {
                await api.put(`/sales/${editing.id}`, { paymentMethod, status });
                setEditOpen(false);
                loadSales();
              } catch (err) {
                console.error('Error actualizando venta', err);
                alert(err?.message || 'Error al actualizar');
              }
            }}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <select title="Método de pago" aria-label="Método de pago" name="paymentMethod" defaultValue={editing.paymentMethod} className="border rounded px-2 py-1">
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>

                <label className="text-sm font-medium">Estado</label>
                <select title="Estado" aria-label="Estado" name="status" defaultValue={editing.status} className="border rounded px-2 py-1">
                  <option value="COMPLETED">Completado</option>
                  <option value="PENDING">Pendiente</option>
                </select>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Guardar</Button>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* View dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogDescription>Información completa de la venta</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Factura:</strong> {viewing.invoiceNumber || `${viewing.id}`}</div>
                <div><strong>Fecha:</strong> {new Date(viewing.createdAt).toLocaleString()}</div>
                <div><strong>Vendedor:</strong> {viewing.user?.name}</div>
                <div><strong>Sucursal:</strong> {viewing.branch?.name}</div>
              </div>
              <div>
                <h3 className="font-medium">Productos</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground"><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                        {viewing.items.map((it: any, i: number) => {
                          const key = `${it.productId}:${it.size || ''}`;
                          const stock = viewingStocks[key];
                          return (
                            <tr key={i} className="border-t">
                              <td>
                                <div className="font-medium">{it.product?.name}</div>
                                <div className="text-xs text-gray-500">Stock actual: <span className="font-semibold">{typeof stock === 'number' ? stock : '-'}</span></div>
                              </td>
                              <td>{it.quantity}</td>
                              <td>{formatCurrency(it.price)}</td>
                              <td>{formatCurrency(it.price * it.quantity)}</td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-4">
                <div className="font-semibold">Total: {formatCurrency(viewing.total)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
