import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SalesTable from "./SalesTable";

export default function SalesIndex() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Historial de Ventas</h1>
        <Button onClick={() => navigate("/dashboard/sales/pos")}>Nueva Venta</Button>
      </div>
      <Card>
        <SalesTable />
      </Card>
    </div>
  );
}
  