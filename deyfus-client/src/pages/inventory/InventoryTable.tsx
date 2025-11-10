import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "./types";

interface Props {
  inventory: InventoryItem[];
  onAdjustStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
  onCreateAlert: (item: InventoryItem) => void;
}

export function InventoryTable({ inventory, onAdjustStock, onViewHistory, onCreateAlert }: Props) {
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return { label: "Sin stock", variant: "destructive" as const };
    }
    if (item.quantity < item.minStock) {
      return { label: "Stock bajo", variant: "secondary" as const };
    }
    if (item.maxStock && item.quantity > item.maxStock) {
      return { label: "Sobre stock", variant: "secondary" as const };
    }
    return { label: "Normal", variant: "default" as const };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Imagen</th>
            <th>Sucursal</th>
            <th>Ubicación</th>
            <th className="text-right">Stock actual</th>
            <th className="text-right">Min / Max</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => {
            const status = getStockStatus(item);
            return (
              <tr key={item.id}>
                <td>
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">{item.product.sku}</div>
                  </div>
                </td>
                <td>
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                </td>
                <td>{item.branch.name}</td>
                <td>{item.location || "-"}</td>
                <td className="text-right font-medium">{item.quantity}</td>
                <td className="text-right">
                  {item.minStock} / {item.maxStock || "-"}
                </td>
                <td>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(item)}
                    >
                      Ajustar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewHistory(item)}
                    >
                      Historial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateAlert(item)}
                    >
                      Alerta
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {inventory.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-muted-foreground">
                No hay inventario registrado
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}