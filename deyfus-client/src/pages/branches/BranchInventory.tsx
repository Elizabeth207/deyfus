import { Package, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface BranchInventoryProps {
  inventory: {
    productId: number;
    productName: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    location?: string;
  }[];
}

export default function BranchInventory({ inventory }: BranchInventoryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="text-blue-500" size={20} />
            <h3 className="font-semibold text-slate-800">Inventario</h3>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700">Ver todo</button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {inventory.map((item) => {
          const isLowStock = item.quantity <= item.minStock;
          const isOverStock = item.maxStock && item.quantity >= item.maxStock;

          return (
            <div key={item.productId} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-700">{item.productName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">Ubicación: {item.location || 'No definida'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {isLowStock && (
                      <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs">
                        <ArrowDown size={14} />
                        <span>Stock bajo</span>
                      </div>
                    )}
                    {isOverStock && (
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                        <ArrowUp size={14} />
                        <span>Sobre stock</span>
                      </div>
                    )}
                    <div className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
                      {item.quantity} unidades
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Mín: {item.minStock} {item.maxStock ? `/ Máx: ${item.maxStock}` : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}