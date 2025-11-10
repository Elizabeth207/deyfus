import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Movement } from "@/lib/types";

interface MovementsTableProps {
  movements: Movement[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  return (
    <Table>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {movements.map((movement) => (
          <tr key={movement.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-gray-900">
                    {new Date(movement.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(movement.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant={
                movement.type === 'ENTRY' ? 'secondary' :
                movement.type === 'EXIT' ? 'destructive' :
                'outline'
              }
              className={
                movement.type === 'ENTRY' ? 'bg-green-100 text-green-800 border-green-200' :
                movement.type === 'EXIT' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }>
                <div className="flex items-center gap-1">
                  {movement.type === 'ENTRY' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {movement.type === 'EXIT' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  )}
                  {movement.type === 'ADJUSTMENT' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  )}
                  {movement.type === 'ENTRY' ? 'Entrada' :
                   movement.type === 'EXIT' ? 'Salida' :
                   'Ajuste'}
                </div>
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <span className={
                movement.type === 'EXIT' ? 'text-red-600' :
                movement.type === 'ENTRY' ? 'text-green-600' :
                'text-gray-900'
              }>
                {movement.type === 'EXIT' ? '-' : '+'}
                {movement.quantity}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {movement.reason}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {movement.reference || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {movement.user.name}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        ))}
        {movements.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-6 text-muted-foreground">
              No hay movimientos registrados
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}