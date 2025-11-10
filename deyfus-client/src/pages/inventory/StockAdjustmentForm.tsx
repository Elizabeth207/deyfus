 import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem } from "./types";

interface Props {
  inventory: InventoryItem;
  onClose: () => void;
  onSubmit: (data: {
    type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    reference?: string;
  }) => Promise<void>;
}

export function StockAdjustmentForm({ inventory, onClose, onSubmit }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const data = {
      type: form.get('type') as 'ENTRY' | 'EXIT' | 'ADJUSTMENT',
      quantity: parseInt(form.get('quantity') as string),
      reason: form.get('reason') as string,
      reference: form.get('reference') as string || undefined
    };

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Ajustar stock</h3>
        
        <div className="bg-muted/50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Producto</div>
              <div className="text-sm text-muted-foreground">{inventory.product.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">SKU</div>
              <div className="text-sm text-muted-foreground">{inventory.product.sku}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Sucursal</div>
              <div className="text-sm text-muted-foreground">{inventory.branch.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Stock actual</div>
              <div className="text-sm text-muted-foreground">{inventory.quantity}</div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de movimiento</label>
            <Select name="type" required>
              <option value="">Selecciona un tipo</option>
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Salida</option>
              <option value="ADJUSTMENT">Ajuste manual</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <Input
              type="number"
              name="quantity"
              min="1"
              required
              placeholder="Cantidad a ajustar"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Para salidas, ingresa la cantidad a restar. Para ajustes manuales, ingresa el nuevo valor total.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Motivo</label>
            <Textarea
              name="reason"
              required
              placeholder="Explica el motivo del ajuste"
              className="resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referencia (opcional)</label>
            <Input
              name="reference"
              placeholder="Ej: Número de factura, orden, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Guardar ajuste
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}