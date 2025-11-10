import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { MovementsTable } from "./MovementsTable";
import { AlertsView } from "./AlertsView";
import { InventoryFilters } from "./InventoryFilters";
import { useApi } from "@/lib/api";
import type { 
  InventoryItem, 
  Movement, 
  StockAlert, 
  Branch, 
  Category 
} from "@/lib/types";

export default function InventoryPage() {
  const navigate = useNavigate();
  const api = useApi();
  
  // Estado
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado de modales
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  
  // Estados
  const [isFiltering, setIsFiltering] = useState(false);
  const [filters, setFilters] = useState({
    branchId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    stockStatus: undefined as string | undefined,
    search: undefined as string | undefined
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  // Manejar debounce de la búsqueda
  useEffect(() => {
    if (filters.search === undefined) return;
    
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || "");
      setIsFiltering(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    loadInventory();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [branchesRes, categoriesRes, alertsRes] = await Promise.all([
        api.getBranches(),
        api.getCategories(),
        api.getAlerts()
      ]);
      
      setBranches(branchesRes.data || []);
      setCategories(categoriesRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setIsFiltering(true);
      const response = await api.getInventory(filters);
      setInventory(response.data);
      
      // Mostrar mensaje cuando hay filtros activos
      if (Object.values(filters).some(v => v !== undefined)) {
        Swal.fire({
          icon: 'info',
          title: 'Resultados filtrados',
          text: `Se encontraron ${response.data.length} productos con los filtros aplicados`,
          showConfirmButton: false,
          timer: 1500,
          background: '#fff',
          customClass: {
            popup: 'rounded-xl shadow-xl border border-gray-100'
          }
        });
      }
    } catch (error) {
      console.error('Error cargando inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el inventario. Por favor intenta de nuevo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100'
        }
      });
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAdjustStock = async (data: {
    type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    reference?: string;
  }) => {
    if (!selectedItem) return;

    try {
      await api.adjustStock(selectedItem.id, data);
      await loadInventory();
      setShowAdjustForm(false);
      setSelectedItem(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Stock ajustado',
        text: 'El ajuste de inventario se realizó correctamente',
        showConfirmButton: false,
        timer: 2000,
        background: '#fff',
        iconColor: '#10B981',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100'
        }
      });
    } catch (error) {
      console.error('Error al ajustar stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo ajustar el stock. Por favor intenta de nuevo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100'
        }
      });
    }
  };

  const handleViewHistory = async (item: InventoryItem) => {
    try {
      const response = await api.getMovements(item.id);
      setMovements(response.data);
      setSelectedItem(item);
      setShowMovements(true);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await Swal.fire({
        title: '¿Resolver alerta?',
        text: '¿Estás seguro de que deseas marcar esta alerta como resuelta?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, resolver',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100'
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          await api.resolveAlert(alertId);
          setAlerts(alerts.filter(a => a.id !== alertId));
          
          Swal.fire({
            icon: 'success',
            title: 'Alerta resuelta',
            text: 'La alerta ha sido marcada como resuelta',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            iconColor: '#10B981',
            customClass: {
              popup: 'rounded-xl shadow-xl border border-gray-100'
            }
          });
        }
      });
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo resolver la alerta. Por favor intenta de nuevo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100'
        }
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg shadow-lg text-white mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
          <p className="text-blue-100 mt-1">Administra el stock de tus productos</p>
        </div>
        <Button 
          onClick={() => navigate('new')}
          className="bg-white text-blue-700 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo inventario
        </Button>
      </div>

      <AlertsView 
        alerts={alerts} 
        onResolve={handleResolveAlert}
      />

      <Card className="p-6 space-y-6">
        <InventoryFilters
          branches={branches}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-white shadow-md border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total de productos
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-md border border-red-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Productos sin stock
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {inventory.filter(i => i.quantity <= 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-md border border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Productos con stock bajo
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventory.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock mínimo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock máximo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.branch.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">{item.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">{item.maxStock || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      item.quantity <= 0 ? "destructive" :
                      item.quantity <= item.minStock ? "secondary" : 
                      "default"
                    }
                    className={
                      item.quantity <= 0 ? "bg-red-100 text-red-800 border-red-200" :
                      item.quantity <= item.minStock ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      "bg-green-100 text-green-800 border-green-200"
                    }>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          item.quantity <= 0 ? "bg-red-500" :
                          item.quantity <= item.minStock ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}></div>
                        {item.quantity <= 0 ? "Sin stock" :
                         item.quantity <= item.minStock ? "Stock bajo" :
                         "Normal"}
                      </div>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(item)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Movimientos
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAdjustForm(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajustar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 14h.01M12 16h.01M12 18h.01M12 20h.01M12 22h.01" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay resultados</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {Object.values(filters).some(v => v !== undefined)
                          ? "No se encontraron productos con los filtros aplicados"
                          : "No hay inventario registrado"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {showAdjustForm && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Ajustar stock
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedItem.product.name}
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAdjustForm(false);
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAdjustStock({
                type: formData.get('type') as 'ENTRY' | 'EXIT' | 'ADJUSTMENT',
                quantity: Number(formData.get('quantity')),
                reason: formData.get('reason') as string,
                reference: formData.get('reference') as string
              });
            }}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de ajuste
                    </label>
                    <select 
                      id="type" 
                      name="type"
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="ENTRY">Entrada</option>
                      <option value="EXIT">Salida</option>
                      <option value="ADJUSTMENT">Ajuste</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-8"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Razón
                  </label>
                  <div className="relative">
                    <textarea 
                      id="reason"
                      name="reason"
                      rows={3}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      id="reference"
                      name="reference"
                      placeholder="Opcional"
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-8"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Guardar ajuste
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showMovements && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Historial de Movimientos
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedItem.product.name} - {selectedItem.product.sku}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMovements(false);
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <MovementsTable movements={movements} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
