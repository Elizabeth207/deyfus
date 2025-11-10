import { Input } from "@/components/ui/input";
import type { Branch, Category } from "@/lib/types";
import { 
  BuildingOfficeIcon, 
  TagIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

interface Props {
  branches: Branch[];
  categories: Category[];
  filters: {
    branchId?: number;
    categoryId?: number;
    stockStatus?: string;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
}

export function InventoryFilters({ branches, categories, filters, onFilterChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
          Sucursal
        </label>
        <div className="relative">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            aria-label="Filtrar por sucursal"
            value={filters.branchId?.toString() || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange('branchId', e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">Todas las sucursales</option>
            {branches.length === 0 ? (
              <option disabled>Cargando sucursales...</option>
            ) : (
              branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-gray-500" />
          Categoría
        </label>
        <div className="relative">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            aria-label="Filtrar por categoría"
            value={filters.categoryId?.toString() || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">Todas las categorías</option>
            {categories.length === 0 ? (
              <option disabled>Cargando categorías...</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-gray-500" />
          Estado de stock
        </label>
        <div className="relative">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            aria-label="Filtrar por estado de stock"
            value={filters.stockStatus || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange('stockStatus', e.target.value || undefined)}
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="low">Bajo stock</option>
            <option value="over">Sobre stock</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
          Buscar
        </label>
        <div className="relative">
          <Input
            type="search"
            placeholder="Nombre, SKU o ubicación"
            value={filters.search || ""}
            onChange={e => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}