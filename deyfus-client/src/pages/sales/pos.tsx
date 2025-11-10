import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { QrScanner } from "@/components/QrScanner";
import Swal from 'sweetalert2';
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function SalesPOS() {
  const api = useApi();
  type InventoryItem = any;
  type CartItem = { inventoryId?: number; productId?: number; size?: string | null; quantity: number; price: number };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/inventory/list");
        const data = Array.isArray(res) ? res : (res && res.data) ? res.data : [];
        setProducts(data || []);
      } catch (err) {
        console.error('Error cargando inventario', err);
      }
    })();
  }, []);

  function addToCart(inv: InventoryItem, qty = 1) {
    const productId = inv.productId;
    const size = inv.size || null;
    const price = Number(inv.product?.price || inv.price || 0);
    const available = inv.quantity ?? 0;
    if (available < qty) {
      toast.error(`Stock insuficiente (disponible: ${available})`);
      return;
    }
    setCart(prev => {
      const found = prev.find(i => i.productId === productId && i.size === size);
      if (found) {
        const newQty = found.quantity + qty;
        if (newQty > available) {
          toast.error(`No hay suficiente stock (disponible: ${available})`);
          return prev;
        }
        return prev.map(i => i.productId === productId && i.size === size ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { inventoryId: inv.id, productId, size, quantity: qty, price }];
    });
    // Mostrar confirmación al usuario
    toast.success('Producto agregado al carrito');
  }

  function handleScan(qr: string) {
    const found = products.find(p => p.product?.qrCode === qr || p.product?.qr === qr);
    if (found) {
      addToCart(found);
      toast.success("Producto agregado por QR");
    } else {
      toast.error("Producto no encontrado");
    }
    setShowQR(false);
  }

  async function handleRegisterSale() {
    if (cart.length === 0) return toast.error("Agrega productos al carrito");
    setLoading(true);
    try {
      const payload = {
        items: cart.map(i => ({ inventoryId: i.inventoryId, productId: i.productId, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal: cart.reduce((a, b) => a + b.price * b.quantity, 0),
        total: cart.reduce((a, b) => a + b.price * b.quantity, 0),
        paymentMethod: paymentMethod
      };
      const res = await api.post("/sales", payload);
      // show success modal
      await Swal.fire({ icon: 'success', title: 'Venta registrada', text: 'La venta se registró correctamente', timer: 1500, showConfirmButton: false });
      setCart([]);
      // opcional: si la API devuelve la venta creada, podríamos navegar o refrescar listados
      console.debug('Venta creada', res);
    } catch (e) {
      const msg = (e && (e as any).message) ? (e as any).message : (e && (e as any).data && (e as any).data.message) ? (e as any).data.message : 'Error al registrar venta';
      console.error('Error registrando venta', e);
      // Mostrar modal de error con la información devuelta
      await Swal.fire({ icon: 'error', title: 'Error registrando venta', text: String(msg) });
    }
    setLoading(false);
  }

  const subtotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Registrar Venta</h1>

      <div className="mb-4 flex justify-center gap-4">
        <Button onClick={() => setShowQR(true)} variant="outline">Escanear QR</Button>
        <Button onClick={() => setCart([])} variant="ghost">Vaciar Carrito</Button>
      </div>

      {showQR && <div className="mb-4"><QrScanner onScan={handleScan} onClose={() => setShowQR(false)} /></div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product search and list */}
        <div className="md:col-span-2">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Buscar producto</h2>
            <div className="flex gap-3 items-center mb-4">
              <Input placeholder="Buscar por nombre o SKU" aria-label="Buscar producto" onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  const q = e.target.value.toLowerCase().trim();
                  const found = products.filter((p: any) => p.product.name.toLowerCase().includes(q) || (p.product.sku || '').toLowerCase().includes(q));
                  setProducts(found);
                }
              }} />
              <Select aria-label="Seleccionar producto" title="Seleccionar producto" onChange={(e: any) => {
                const val = e.target.value; if (!val) return; const invId = Number(val);
                const inv = products.find((p: any) => p.id === invId); if (inv) addToCart(inv);
              }} className="flex-1">
                <option value="">Selecciona producto</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.product.name}{p.size ? ` - Talla ${p.size}` : ''} (Stock: {p.quantity})</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 12).map((p: any) => (
                <div key={p.id} className="p-3 border rounded-lg flex flex-col justify-between hover:shadow-md hover:bg-indigo-50 transition">
                  <div>
                    <div className="font-medium text-lg">{p.product.name}</div>
                    <div className="text-sm text-gray-500">{p.size ? `Talla ${p.size}` : p.product.brand || ''}</div>
                    <div className="text-sm mt-2">Stock: <span className="font-semibold">{p.quantity}</span></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-semibold text-base">{formatCurrency(Number(p.product.price || 0))}</div>
                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => addToCart(p)}>Agregar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart summary */}
        <aside className="bg-white border rounded-lg p-4 shadow-sm sticky top-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Carrito</h2>
            <div className="text-sm text-gray-600">{cart.length} {cart.length === 1 ? 'item' : 'items'}</div>
          </div>
          {cart.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">Carrito vacío</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => {
                const prod = products.find((p: any) => p.id === item.inventoryId || p.productId === item.productId);
                return (
                  <div key={idx} className="flex items-start justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium">{prod?.product?.name || item.productId} {item.size ? `(Talla ${item.size})` : ''}</div>
                      <div className="text-sm text-gray-500">{prod ? `Stock: ${prod.quantity}` : '-'}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button aria-label="Disminuir" className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" onClick={() => setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))}>
                        -
                      </button>
                      <div className="px-3">{item.quantity}</div>
                      <button aria-label="Aumentar" className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" onClick={() => {
                        const stock = prod?.quantity ?? 0;
                        setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.min(stock || it.quantity + 1, it.quantity + 1) } : it));
                      }}>+</button>
                      <div className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</div>
                      <Button size="sm" variant="ghost" onClick={() => setCart(cart.filter((_, i) => i !== idx))}>Quitar</Button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>Impuesto</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Método de pago</label>
                <Select name="payment" aria-label="Método de pago" title="Método de pago" value={paymentMethod} onChange={(e: any) => setPaymentMethod(e.target.value)}>
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                </Select>
              </div>

              <Button onClick={handleRegisterSale} disabled={loading || cart.length === 0} className="w-full mt-4 bg-indigo-600 text-white hover:bg-indigo-700">Registrar Venta</Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
