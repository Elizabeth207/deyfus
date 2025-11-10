import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface FilterValues {
  startDate: string;
  endDate: string;
  branchId: string;
  type: 'all' | 'income' | 'expense';
}

interface FinanceFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

export default function FinanceFilters({ filters, onFilterChange }: FinanceFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <p className="text-sm text-gray-500 mt-1">Personaliza tu vista de transacciones</p>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de transacción</Label>
          <div className="mt-1 relative">
            <Select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition-colors duration-200"
            >
              <option value="all">Todas las transacciones</option>
              <option value="income">Solo ingresos</option>
              <option value="expense">Solo gastos</option>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha inicio</Label>
            <div className="mt-1">
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha fin</Label>
            <div className="mt-1">
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Sucursal</Label>
          <div className="mt-1 relative">
            <Select
              id="branchId"
              name="branchId"
              value={filters.branchId}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition-colors duration-200"
            >
              <option value="">Todas las sucursales</option>
              <option value="1">Sucursal Principal</option>
              <option value="2">Sucursal Norte</option>
              <option value="3">Sucursal Sur</option>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}