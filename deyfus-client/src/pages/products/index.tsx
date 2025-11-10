import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RecordsModal } from '@/components/RecordsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Plus, Eye, QrCode, Download, Copy, Edit, Power, Trash } from 'lucide-react';
import type { Product, Branch } from '@/lib/types';
import Swal from 'sweetalert2';
import { formatCurrency } from '@/lib/utils';
import { useApi, API_BASE } from '@/lib/api';

export default function ProductsPage() {
  const navigate = useNavigate();
  const api = useApi();
  useAuth();
  
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    branchId: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    mainProducts: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, branchesRes] = await Promise.all([
        api.getProducts(),
        api.getBranches()
      ]);
      setProducts(productsRes.data || []);
      setBranches(branchesRes.data || []);
      
      // Debug log
      console.log('Productos cargados:', productsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalStock = (product: Product) => {
    if (product.stock !== undefined) return product.stock;
    return (product.inventory || []).reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  };

  const filteredProducts = products.filter(product => {
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.branchId && !product.inventory?.some(inv => inv.branchId === parseInt(filters.branchId))) {
      return false;
    }
    if (filters.status === 'active' && !product.isActive) {
      return false;
    }
    if (filters.status === 'inactive' && product.isActive) {
      return false;
    }
    if (filters.mainProducts && !product.isMainProduct) {
      return false;
    }
    return true;
  });

  const handleAction = async (action: string, record: Product) => {
    try {
      switch (action) {
        case 'edit':
          navigate(`/dashboard/products/${record.id}/edit`);
          break;
          
        case 'delete':
          const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: `¿Estás seguro que deseas eliminar "${record.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          });

          if (!result.isConfirmed) return false;
          
          await api.del(`/products/${record.id}`);
          await loadData(); // Recargar productos
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Producto eliminado correctamente'
          });
          return true;

        case 'toggle':
          const toggleResult = await Swal.fire({
            title: `¿${record.isActive ? 'Desactivar' : 'Activar'} producto?`,
            text: `¿Estás seguro que deseas ${record.isActive ? 'desactivar' : 'activar'} "${record.name}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
          });

          if (!toggleResult.isConfirmed) return false;
          
          await api.put(`/products/${record.id}`, {
            isActive: !record.isActive
          });
          await loadData(); // Recargar productos
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: `Producto ${record.isActive ? 'desactivado' : 'activado'} correctamente`
          });
          return true;
      }
    } catch (error) {
      console.error('Error en acción:', action, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar la acción'
      });
      return false;
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
              Productos
            </h1>
            <p className="text-gray-500 mt-1">Gestiona tu inventario de calzado</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowProductsModal(true)}
              variant="outline"
            >
              Vista de tabla
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/products/new')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <Select
              value={filters.branchId}
              onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
            >
              <option value="">Todas las sucursales</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as 'all' | 'active' | 'inactive' })}
            >
              <option value="all">Todos los productos</option>
              <option value="active">Productos activos</option>
              <option value="inactive">Productos inactivos</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mainProducts"
              checked={filters.mainProducts}
              onChange={(e) => setFilters({ ...filters, mainProducts: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="mainProducts" className="text-sm text-gray-600">
              Solo productos principales
            </label>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      {/* Estado de carga */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 ${!product.isActive ? 'opacity-75' : ''}`}>
              <div className="aspect-square relative group">
                {!product.isActive && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10 text-white font-medium">
                    Inactivo
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity z-10"></div>
                {product.imageUrl ? (
                  <img 
                    src={`${API_BASE}${product.imageUrl}`} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevenir loop infinito
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                          <ShoppingBag class="w-12 h-12 text-gray-300 mb-2" />
                          <span class="text-sm text-gray-400">Imagen no disponible</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mb-2 transform group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm text-gray-400">Sin imagen</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: `<div class="flex items-center gap-2">
                          <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Detalles del Producto</span>
                        </div>`,
                        html: `
                          <div class="space-y-6 text-left">
                            <div class="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                              ${product.imageUrl 
                                ? `<img src="${API_BASE}${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover">`
                                : `<div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg class="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                   </div>`
                              }
                              ${product.isActive 
                                ? `<div class="absolute top-2 right-2">
                                     <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>
                                   </div>`
                                : `<div class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                                     <span class="px-4 py-2 text-white font-medium">Inactivo</span>
                                   </div>`
                              }
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                              <div>
                                <h3 class="text-sm font-medium text-gray-500">Nombre</h3>
                                <p class="mt-1 text-lg font-semibold">${product.name}</p>
                              </div>
                              <div>
                                <h3 class="text-sm font-medium text-gray-500">SKU</h3>
                                <p class="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">${product.sku}</p>
                              </div>
                              <div>
                                <h3 class="text-sm font-medium text-gray-500">Precio</h3>
                                <p class="mt-1 text-lg font-bold text-blue-600">${formatCurrency(product.price)}</p>
                              </div>
                              <div>
                                <h3 class="text-sm font-medium text-gray-500">Stock Total</h3>
                                <p class="mt-1">
                                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                    totalStock(product) <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                  }">
                                    ${totalStock(product)} unidades
                                  </span>
                                </p>
                              </div>
                              ${product.category ? `
                                <div>
                                  <h3 class="text-sm font-medium text-gray-500">Categoría</h3>
                                  <p class="mt-1">${product.category.name}</p>
                                </div>
                              ` : ''}
                              ${product.brand ? `
                                <div>
                                  <h3 class="text-sm font-medium text-gray-500">Marca</h3>
                                  <p class="mt-1">${product.brand}</p>
                                </div>
                              ` : ''}
                            </div>

                            ${product.description ? `
                              <div class="bg-white p-4 rounded-lg shadow-sm">
                                <h3 class="text-sm font-medium text-gray-500">Descripción</h3>
                                <p class="mt-2 text-gray-600">${product.description}</p>
                              </div>
                            ` : ''}

                            <div class="border-t pt-4 mt-4">
                              <h3 class="text-sm font-medium text-gray-500 mb-2">Inventario por Sucursal</h3>
                              <div class="grid gap-2">
                                ${(product.inventory || []).map(inv => `
                                  <div class="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <span class="font-medium text-gray-700">${inv.branch?.name || 'Sucursal'}</span>
                                    <span class="px-2 py-1 rounded-full text-sm ${inv.quantity <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}">
                                      ${inv.quantity} unidades
                                    </span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                            <div class="bg-blue-50 p-4 rounded-lg mt-4">
                              <div class="flex items-center gap-2 text-blue-700 mb-2">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 class="font-medium">Información Adicional</h3>
                              </div>
                              <ul class="space-y-2 text-sm text-blue-600">
                                <li>• Última actualización: ${new Date(product.updatedAt).toLocaleString()}</li>
                                <li>• Creado: ${new Date(product.createdAt).toLocaleString()}</li>
                                ${product.lastSale ? `<li>• Última venta: ${new Date(product.lastSale).toLocaleString()}</li>` : ''}
                              </ul>
                            </div>
                          </div>
                        `,
                        width: '40rem',
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: {
                          popup: 'rounded-xl',
                          title: 'border-b pb-3',
                          htmlContainer: 'overflow-y-auto max-h-[80vh]'
                        }
                      });
                    }}
                    className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium shadow-lg transform hover:scale-105 transition-transform"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate hover:text-blue-600 cursor-pointer transition-colors" 
                  onClick={() => navigate(`/dashboard/products/${product.id}`)}
                  title={product.name}>
                {product.name}
              </h3>
              <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{product.sku}</span>
                {product.category && (
                  <span className="text-xs text-gray-400">{product.category.name}</span>
                )}
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="font-medium text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {formatCurrency(product.price)}
                </div>
                <Badge variant={totalStock(product) <= 5 ? 'destructive' : 'default'}
                       className="animate-pulse">
                  Stock: {totalStock(product)}
                </Badge>
              </div>
              <div className="flex justify-center mb-4">
                <Badge
                  className={`w-3/4 justify-center transform hover:scale-105 transition-transform ${
                    product.isActive 
                      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </div>
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Detalles del Producto',
                        html: `
                          <div class="space-y-4 text-left">
                            <div class="flex gap-4 items-start">
                              <div class="relative w-24 h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                ${product.imageUrl 
                                  ? `<img src="${API_BASE}${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover">`
                                  : `<div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                      </svg>
                                     </div>`
                                }
                                ${!product.isActive && `
                                  <div class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                                    <span class="px-2 py-0.5 text-xs text-white font-medium">Inactivo</span>
                                  </div>
                                `}
                              </div>
                              
                              <div class="flex-1">
                                <h3 class="font-medium text-lg">${product.name}</h3>
                                <div class="text-sm text-gray-500 flex items-center gap-2">
                                  <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">${product.sku}</span>
                                  ${product.category ? `
                                    <span class="text-xs">•</span>
                                    <span>${product.category.name}</span>
                                  ` : ''}
                                </div>
                                <div class="mt-2 flex items-center justify-between">
                                  <span class="text-lg font-bold text-blue-600">${formatCurrency(product.price)}</span>
                                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    totalStock(product) <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                  }">
                                    Stock: ${totalStock(product)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            ${product.description ? `
                              <div class="text-sm bg-gray-50 p-3 rounded">
                                <p class="text-gray-600">${product.description}</p>
                              </div>
                            ` : ''}

                            <div class="border-t pt-3">
                              <h4 class="text-xs font-medium text-gray-500 mb-2">Inventario por Sucursal</h4>
                              <div class="grid gap-1">
                                ${(product.inventory || []).map(inv => `
                                  <div class="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded text-sm">
                                    <span class="text-gray-700">${inv.branch?.name || 'Sucursal'}</span>
                                    <span class="text-xs font-medium ${inv.quantity <= 5 ? 'text-red-600' : 'text-green-600'}">
                                      ${inv.quantity} unid.
                                    </span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>
                          </div>
                        `,
                        showCloseButton: true,
                        showConfirmButton: false,
                        width: '24rem',
                        customClass: {
                          popup: 'rounded-lg'
                        }
                      });
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      // Código QR con opciones avanzadas
                      Swal.fire({
                        title: `<div class="flex items-center gap-2">
                          <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6-4h2m2 0v4m-6-4h2m2 0v4m-6-4h2" />
                          </svg>
                          <span>Código QR: ${product.name}</span>
                        </div>`,
                        html: `
                          <div class="space-y-4">
                            <div id="qr-code" class="flex justify-center p-4 bg-white rounded-xl shadow-inner"></div>
                            <div class="grid grid-cols-3 gap-3 mt-4">
                              <button id="download-svg" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                SVG
                              </button>
                              <button id="download-png" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                PNG
                              </button>
                              <button id="copy-qr" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                Copiar
                              </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">
                              Escanea este código QR para acceder rápidamente a los detalles del producto
                            </p>
                          </div>
                        `,
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: {
                          popup: 'rounded-xl',
                          title: 'border-b pb-3'
                        },
                        didOpen: async () => {
                          const container = document.getElementById('qr-code');
                          if (container) {
                            const QRCode = await import('qrcode');
                            const qrValue = product.qrCode || product.sku || `prod-${product.id}`;
                            
                            // Generar QR en canvas con estilo mejorado
                            const canvas = document.createElement('canvas');
                            await QRCode.toCanvas(canvas, qrValue, {
                              width: 240,
                              margin: 2,
                              color: {
                                dark: '#4F46E5', // Índigo para mejor aspecto
                                light: '#FFFFFF'
                              },
                              errorCorrectionLevel: 'H' // Mayor precisión
                            });
                            container.appendChild(canvas);

                            // Evento para SVG
                            document.getElementById('download-svg')?.addEventListener('click', async () => {
                              const svgString = await QRCode.toString(qrValue, {
                                type: 'svg',
                                margin: 2,
                                color: {
                                  dark: '#4F46E5',
                                  light: '#FFFFFF'
                                },
                                errorCorrectionLevel: 'H'
                              });
                              const blob = new Blob([svgString], { type: 'image/svg+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `qr-${product.sku || product.id}.svg`;
                              a.click();
                              URL.revokeObjectURL(url);

                              // Mostrar toast de éxito
                              const Toast = Swal.mixin({
                                toast: true,
                                position: 'bottom-end',
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true
                              });
                              Toast.fire({
                                icon: 'success',
                                title: 'SVG descargado correctamente'
                              });
                            });

                            // Evento para PNG
                            document.getElementById('download-png')?.addEventListener('click', () => {
                              const a = document.createElement('a');
                              a.href = canvas.toDataURL('image/png');
                              a.download = `qr-${product.sku || product.id}.png`;
                              a.click();

                              // Mostrar toast de éxito
                              const Toast = Swal.mixin({
                                toast: true,
                                position: 'bottom-end',
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true
                              });
                              Toast.fire({
                                icon: 'success',
                                title: 'PNG descargado correctamente'
                              });
                            });

                            // Evento para copiar
                            document.getElementById('copy-qr')?.addEventListener('click', async () => {
                              try {
                                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                                if (blob) {
                                await navigator.clipboard.write([
                                  new ClipboardItem({ 'image/png': blob as Blob })
                                  ]);
                                  
                                  // Mostrar toast de éxito
                                  const Toast = Swal.mixin({
                                    toast: true,
                                    position: 'bottom-end',
                                    showConfirmButton: false,
                                    timer: 3000,
                                    timerProgressBar: true
                                  });
                                  Toast.fire({
                                    icon: 'success',
                                    title: 'Código QR copiado al portapapeles'
                                  });
                                }
                              } catch (err) {
                                console.error('Error al copiar:', err);
                                Swal.fire({
                                  icon: 'error',
                                  title: 'Error',
                                  text: 'No se pudo copiar el código QR',
                                  showConfirmButton: false,
                                  timer: 2000
                                });
                              }
                            });
                          }
                        }
                      });
                    }}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md"
                    title="Ver QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Copiar información
                      const text = `${product.name}\nSKU: ${product.sku}\nPrecio: ${formatCurrency(product.price)}\nStock: ${totalStock(product)}`;
                      navigator.clipboard.writeText(text);
                      Swal.fire({
                        icon: 'success',
                        title: 'Copiado',
                        text: 'Información copiada al portapapeles',
                        timer: 1500,
                        showConfirmButton: false
                      });
                    }}
                    className="p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md"
                    title="Copiar información"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const url = product.imageUrl;
                      if (url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${product.sku || product.id}-image.jpg`;
                        a.click();
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md"
                    title="Descargar imagen"
                    disabled={!product.imageUrl}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                    className="flex items-center justify-center p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md group"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 group-hover:animate-spin" />
                  </button>
                  <button
                    onClick={() => handleAction('toggle', product)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md group
                      ${product.isActive 
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    title={product.isActive ? 'Desactivar' : 'Activar'}
                  >
                    <Power className="w-4 h-4 group-hover:animate-pulse" />
                  </button>
                  <button
                    onClick={() => handleAction('delete', product)}
                    className="flex items-center justify-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110 hover:shadow-md group"
                    title="Eliminar"
                  >
                    <Trash className="w-4 h-4 group-hover:animate-bounce" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Modal de vista en tabla */}
      <RecordsModal
        endpoint="/products"
        title="Productos"
        isOpen={showProductsModal}
        onClose={() => setShowProductsModal(false)}
        compact={true}
        columns={[
          {
            key: 'product',
            label: 'Producto',
            format: (value: any) => {
              const product = value as Product;
              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={`${API_BASE}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-lg">
                              <ShoppingBag class="w-6 h-6 text-gray-300" />
                              <span class="text-xs text-gray-400 mt-1">No disponible</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                        <span className="text-xs text-gray-400 mt-1">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.sku}</div>
                  </div>
                </div>
              );
            }
          },
          {
            key: 'category',
            label: 'Categoría',
            format: (value: any) => {
              const product = value as Product;
              return product.category?.name || '-';
            }
          },
          {
            key: 'price',
            label: 'Precio',
            format: (value: any) => {
              const product = value as Product;
              return formatCurrency(product.price);
            }
          },
          {
            key: 'stock',
            label: 'Stock',
            format: (value: any) => {
              const product = value as Product;
              return (
                <Badge variant={totalStock(product) <= 5 ? 'destructive' : 'default'}>
                  {totalStock(product)}
                </Badge>
              );
            }
          },
          {
            key: 'status',
            label: 'Estado',
            format: (value: any) => {
              const product = value as Product;
              return (
                <Badge
                  className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              );
            }
          }
        ]}
        actions={[
          {
            label: 'Ver detalles',
            onClick: (record) => navigate(`/dashboard/products/${record.id}`),
            variant: 'outline'
          },
          {
            label: 'Editar',
            onClick: (record: any) => handleAction('edit', record as Product),
            variant: 'outline'
          },
          {
            label: 'Ver código QR',
            onClick: (record: any) => {
              const product = record as Product;
              // Abrir modal QR para el producto con opciones avanzadas
              Swal.fire({
                title: `<div class="flex items-center gap-2">
                  <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6-4h2m2 0v4m-6-4h2m2 0v4m-6-4h2" />
                  </svg>
                  <span>Código QR: ${product.name}</span>
                </div>`,
                html: `
                  <div class="space-y-4">
                    <div id="qr-code" class="flex justify-center p-4 bg-white rounded-xl shadow-inner"></div>
                    <div class="grid grid-cols-3 gap-3 mt-4">
                      <button id="download-svg" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        SVG
                      </button>
                      <button id="download-png" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        PNG
                      </button>
                      <button id="copy-qr" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Copiar
                      </button>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">
                      Escanea este código QR para acceder rápidamente a los detalles del producto
                    </p>
                  </div>
                `,
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-xl',
                  title: 'border-b pb-3'
                },
                didOpen: async () => {
                  const container = document.getElementById('qr-code');
                  if (container) {
                    const QRCode = await import('qrcode');
                    const qrValue = product.qrCode || product.sku || `prod-${product.id}`;
                    
                    // Generar QR en canvas con estilo mejorado
                    const canvas = document.createElement('canvas');
                    await QRCode.toCanvas(canvas, qrValue, {
                      width: 240,
                      margin: 2,
                      color: {
                        dark: '#4F46E5', // Índigo para mejor aspecto
                        light: '#FFFFFF'
                      },
                      errorCorrectionLevel: 'H' // Mayor precisión
                    });
                    container.appendChild(canvas);

                    // Evento para SVG
                    document.getElementById('download-svg')?.addEventListener('click', async () => {
                      const svgString = await QRCode.toString(qrValue, {
                        type: 'svg',
                        margin: 2,
                        color: {
                          dark: '#4F46E5',
                          light: '#FFFFFF'
                        },
                        errorCorrectionLevel: 'H'
                      });
                      const blob = new Blob([svgString], { type: 'image/svg+xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `qr-${product.sku || product.id}.svg`;
                      a.click();
                      URL.revokeObjectURL(url);

                      // Mostrar toast de éxito
                      const Toast = Swal.mixin({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                      });
                      Toast.fire({
                        icon: 'success',
                        title: 'SVG descargado correctamente'
                      });
                    });

                    // Evento para PNG
                    document.getElementById('download-png')?.addEventListener('click', () => {
                      const a = document.createElement('a');
                      a.href = canvas.toDataURL('image/png');
                      a.download = `qr-${product.sku || product.id}.png`;
                      a.click();

                      // Mostrar toast de éxito
                      const Toast = Swal.mixin({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                      });
                      Toast.fire({
                        icon: 'success',
                        title: 'PNG descargado correctamente'
                      });
                    });

                    // Evento para copiar
                    document.getElementById('copy-qr')?.addEventListener('click', async () => {
                      try {
                        const blob = await new Promise(resolve => canvas.toBlob(resolve));
                        if (blob) {
                          await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                          ]);
                          
                          // Mostrar toast de éxito
                          const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                          });
                          Toast.fire({
                            icon: 'success',
                            title: 'Código QR copiado al portapapeles'
                          });
                        }
                      } catch (err) {
                        console.error('Error al copiar:', err);
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: 'No se pudo copiar el código QR',
                          showConfirmButton: false,
                          timer: 2000
                        });
                      }
                    });
                  }
                }
              });
            },
            variant: 'outline'
          },
          {
            label: 'Desactivar/Activar',
            onClick: (record: any) => handleAction('toggle', record as Product),
            variant: 'outline'
          },
          {
            label: 'Eliminar',
            onClick: (record: any) => handleAction('delete', record as Product),
            variant: 'destructive'
          }
        ]}
      />
    </div>
  );
}

