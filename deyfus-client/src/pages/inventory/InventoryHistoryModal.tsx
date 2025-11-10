import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Movement, InventoryItem } from "./types";

interface Props {
  inventory: InventoryItem;
  movements: Movement[];
  onClose: () => void;
}

const typeLabels = {
  ENTRY: { label: "Entrada", variant: "default" as const },
  EXIT: { label: "Salida", variant: "destructive" as const },
  ADJUSTMENT: { label: "Ajuste", variant: "secondary" as const }
};

export function InventoryHistoryModal({ inventory, movements, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Historial de movimientos</h3>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium">Producto</div>
              <div className="text-sm text-muted-foreground">
                {inventory.product.name}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">SKU</div>
              <div className="text-sm text-muted-foreground">
                {inventory.product.sku}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Sucursal</div>
              <div className="text-sm text-muted-foreground">
                {inventory.branch.name}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th className="text-right">Stock anterior</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Stock nuevo</th>
                <th>Motivo</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => (
                <tr key={movement.id}>
                  <td>
                    {format(new Date(movement.createdAt), 'PPp', { locale: es })}
                  </td>
                  <td>
                    <Badge variant={typeLabels[movement.type].variant}>
                      {typeLabels[movement.type].label}
                    </Badge>
                  </td>
                  <td>{movement.user.name}</td>
                  <td className="text-right">{movement.previousStock}</td>
                  <td className="text-right">
                    {movement.type === 'EXIT' ? '-' : '+'}
                    {movement.quantity}
                  </td>
                  <td className="text-right">{movement.newStock}</td>
                  <td>{movement.reason}</td>
                  <td>{movement.reference || "-"}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted-foreground">
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}