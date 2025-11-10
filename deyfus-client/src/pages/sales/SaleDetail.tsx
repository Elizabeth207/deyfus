import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import Swal from "sweetalert2";
import type { Sale } from "@/lib/types";

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSale() {
      setLoading(true);
      try {
        const res = await api.get(`/sales/${id}`);
        setSale(res.data);
      } catch (error) {
        toast.error("No se pudo cargar la venta");
        setSale(null);
      }
      setLoading(false);
    }
    
    fetchSale();
  }, [id, api]);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!sale) {
    return <div className="p-6">Venta no encontrada</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detalle de Venta</h1>
      <Card className="mb-4 p-4">
  <div className="mb-2">Factura: <b>{sale.invoiceNumber || `${sale.id}`}</b></div>
        <div className="mb-2">Fecha: {new Date(sale.createdAt).toLocaleString()}</div>
        <div className="mb-2">Vendedor: {sale.user?.name}</div>
        <div className="mb-2">Total: {formatCurrency(sale.total)}</div>
        <div className="mb-2">
          Método de Pago: <Badge variant="outline">{sale.paymentMethod}</Badge>
        </div>
        <div className="mb-2">
          Estado: <Badge variant={sale.status === 'COMPLETED' ? 'default' : 'secondary'}>
            {sale.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
          </Badge>
        </div>
      </Card>

      <h2 className="font-semibold mb-2">Productos</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-center">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sale.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.product?.name || item.productId}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                <td className="px-4 py-2 text-right">{formatCurrency(sale.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex gap-2 justify-end">
        <Button 
          variant="outline"
          onClick={() => navigate("/sales")}
        >
          Volver
        </Button>
        {sale.status !== 'CANCELLED' && (
          <Button 
            variant="destructive"
            onClick={() => {
              Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, cancelar venta',
                cancelButtonText: 'No, mantener'
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    await api.put(`/sales/${sale.id}/cancel`);
                    toast.success('Venta cancelada exitosamente');
                    navigate('/sales');
                  } catch (error) {
                    toast.error('Error al cancelar la venta');
                  }
                }
              });
            }}
          >
            Cancelar Venta
          </Button>
        )}
      </div>
    </div>
  );
}