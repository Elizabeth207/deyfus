import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem } from "./types";

interface Props {
  inventory: InventoryItem;
  onClose: () => void;
  onSubmit: (data: {
    type: 'LOW_STOCK' | 'OVERSTOCK';
    message: string;
  }) => Promise<void>;
}

export function StockAlertForm({ inventory, onClose, onSubmit }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const data = {
      type: form.get('type') as 'LOW_STOCK' | 'OVERSTOCK',
      message: form.get('message') as string
    };

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Crear alerta de stock</h3>
        
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
            <label className="block text-sm font-medium mb-1">Tipo de alerta</label>
            <Select name="type" required>
              <option value="">Selecciona un tipo</option>
              <option value="LOW_STOCK">Stock bajo</option>
              <option value="OVERSTOCK">Sobre stock</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensaje</label>
            <Textarea
              name="message"
              required
              placeholder="Describe el motivo de la alerta"
              className="resize-none"
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
              Crear alerta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}