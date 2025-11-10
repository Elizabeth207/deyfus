import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useApi } from '@/lib/api';

export type GenericRecord = {
  id: number;
  [key: string]: any;
};

interface Column<T = any> {
  key: string;
  label: string;
  format?: (value: T) => string | JSX.Element;
}

interface RecordsModalProps<T extends GenericRecord = GenericRecord> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  columns: Column<T>[];
  params?: Record<string, any>;
  onRowClick?: (record: T) => void;
  actions?: {
    label: string;
    onClick: (record: T) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  }[];
  compact?: boolean; // if true, render a more compact, dense table (for product lists)
}

export function RecordsModal<T extends GenericRecord = GenericRecord>({
  isOpen,
  onClose,
  title,
  endpoint,
  columns,
  params = {},
  onRowClick,
  actions = []
  , compact = false
}: RecordsModalProps) {
  const api = useApi();
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, endpoint]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(endpoint, { ...params, q: search || undefined });
      setRecords(Array.isArray(response) ? response : response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar registros');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => 
    search
      ? columns.some(col => 
          String(record[col.key])
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : true
  );

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent
        className={
          compact
            ? 'max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-white border shadow-lg p-4'
            : 'max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-white border shadow-lg'
        }
        onPointerDownOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={compact ? 'max-w-md text-sm' : 'max-w-sm'}
          />
        </div>

        {error ? (
          <Card className="p-4 text-red-600">{error}</Card>
        ) : loading ? (
          <Card className="p-4 text-center">Cargando...</Card>
        ) : filteredRecords.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">No hay registros</Card>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={compact ? 'px-3 py-2 text-left text-sm font-medium' : 'px-4 py-2 text-left font-medium'}
                    >
                      {col.label}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className={compact ? 'px-3 py-2 text-right text-sm' : 'px-4 py-2 text-right'}>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(record)}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={compact ? 'px-3 py-2 text-sm align-top' : 'px-4 py-2'}
                      >
                        {col.format ? col.format(record) : record[col.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className={compact ? 'px-3 py-2 text-right' : 'px-4 py-2 text-right'}>
                        <div className="flex gap-2 justify-end">
                          {actions.map(action => (
                            <Button
                              key={action.label}
                              variant={action.variant || 'outline'}
                              size={compact ? 'sm' : 'sm'}
                              onClick={e => {
                                e.stopPropagation();
                                action.onClick(record);
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}