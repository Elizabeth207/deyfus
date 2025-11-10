import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "./types";

interface Props {
  inventory: InventoryItem[];
}

export function InventorySummary({ inventory }: Props) {
  const total = inventory.length;
  const lowStock = inventory.filter(item => item.quantity < item.minStock).length;
  const overStock = inventory.filter(item => item.maxStock && item.quantity > item.maxStock).length;
  const normal = total - lowStock - overStock;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <div className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Total productos</div>
          <div className="text-2xl font-bold mt-1">{total}</div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">Stock normal</div>
            <Badge variant="default">{normal}</Badge>
          </div>
          <div className="text-sm mt-2">
            Productos con nivel de stock óptimo
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">Stock bajo</div>
            <Badge variant="destructive">{lowStock}</Badge>
          </div>
          <div className="text-sm mt-2">
            Productos por debajo del mínimo
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">Sobre stock</div>
            <Badge variant="secondary">{overStock}</Badge>
          </div>
          <div className="text-sm mt-2">
            Productos por encima del máximo
          </div>
        </div>
      </Card>
    </div>
  );
}