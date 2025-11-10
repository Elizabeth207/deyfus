import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import type { StockAlert } from "@/lib/types";

interface AlertsViewProps {
  alerts: StockAlert[];
  onResolve: (alertId: number) => Promise<void>;
}

export function AlertsView({ alerts, onResolve }: AlertsViewProps) {
  if (alerts.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Alertas de inventario</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Badge 
                variant={
                  alert.type === 'OUT_OF_STOCK' ? 'destructive' :
                  alert.type === 'LOW_STOCK' ? 'secondary' :
                  'outline'
                }
              >
                {alert.type === 'OUT_OF_STOCK' ? 'Sin stock' :
                 alert.type === 'LOW_STOCK' ? 'Stock bajo' :
                 'Stock excedido'}
              </Badge>
              <div>
                <p className="font-medium">
                  {alert.inventoryItem.product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sucursal: {alert.inventoryItem.branch.name}
                </p>
              </div>
            </div>
            <Tooltip text="Marcar como resuelto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(alert.id)}
              >
                Resolver
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </Card>
  );
}