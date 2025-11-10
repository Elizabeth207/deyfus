import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useApi, API_BASE } from '@/lib/api';
import { 
  ShoppingBag, 
  Package, 
  Edit, 
  Tag, 
  Store, 
  DollarSign,
  BarChart3,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';

interface InventoryMovement {
  id: number;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number;
  description?: string;
  brand?: string;
  imageUrl?: string;
  qrCode: string;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
  };
  inventory: Array<{
    id: number;
    quantity: number;
    branch: {
      id: number;
      name: string;
    };
  }>;
  inventoryMovements: InventoryMovement[];
}

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();

  // Validar el ID al inicio
  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      Swal.fire({
        title: 'Error',
        text: 'ID de producto inválido',
        icon: 'error'
      });
      navigate('/dashboard/products');
    }
  }, [id, navigate]);
  const [movementType, setMovementType] = useState<'ENTRY' | 'EXIT' | 'ADJUSTMENT'>('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [updatingInventory, setUpdatingInventory] = useState(false);

  // Efecto para cargar el producto cuando cambia el ID
  useEffect(() => {
    let isSubscribed = true;
    
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await get(`/products/${id}`);
        console.log('API Response:', response);
        
        if (!response) {
          throw new Error('No se encontró el producto');
        }

        // Solo actualizar el estado si el componente sigue montado
        if (isSubscribed) {
          setProduct(response);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
        if (isSubscribed) {
          setLoading(false);
          await Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información del producto',
            icon: 'error'
          });
          navigate('/dashboard/products');
        }
      }
    };

    loadProduct();

    // Cleanup function para evitar actualizaciones en un componente desmontado
    return () => {
      isSubscribed = false;
    };
  }, [id, get, navigate]);

  const handleInventoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !quantity || !reason) return;

    setUpdatingInventory(true);
    try {
      await post(`/api/products/${id}/inventory`, {
        branchId: selectedBranch,
        quantity: parseInt(quantity),
        type: movementType,
        reason
      });
      
      // Recargar producto
      if (id) {
        const response = await get(`/products/${id}`);
        if (response) {
          setProduct(response);
        }
      }
      
      setQuantity('');
      setReason('');
      
      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Actualizado!',
        text: 'El inventario se ha actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el inventario',
        icon: 'error'
      });
    } finally {
      setUpdatingInventory(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cargando producto...</h1>
          <Button 
            onClick={() => navigate('/dashboard/products')}
            variant="outline"
          >
            Volver
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-blue-50 rounded-lg"></div>
              <div className="h-16 bg-green-50 rounded-lg"></div>
              <div className="border-t pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-800">Producto no encontrado</h1>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/products')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Volver a productos
          </Button>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-gray-800 mb-2">Lo sentimos</h2>
          <p className="text-gray-500 mb-6">No se pudo encontrar la información del producto solicitado</p>
          <Button 
            onClick={() => navigate('/dashboard/products')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Ver todos los productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {product.name}
          </h1>
          <p className="text-gray-500 mt-1">SKU: {product.sku}</p>
        </div>
        <div className="space-x-3">
          <Button 
            onClick={() => navigate('/dashboard/products')}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Volver
          </Button>
          <Button 
            onClick={() => navigate(`/dashboard/products/${id}/edit`)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1: Información básica */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <Package className="w-5 h-5 text-blue-500" />
            Información del Producto
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Precio de Venta</p>
              <p className="text-2xl font-bold text-blue-700">
                S/ {product.price.toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Costo</p>
              <p className="text-2xl font-bold text-green-700">
                S/ {product.cost.toFixed(2)}
              </p>
            </div>

            <div className="border-t pt-4">
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Categoría</dt>
                  <dd className="font-medium text-gray-900">{product.category?.name || 'N/A'}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Marca</dt>
                  <dd className="font-medium text-gray-900">{product.brand || 'N/A'}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Estado</dt>
                  <dd>
                    <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>

            {product.description && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Gestión de Inventario</h2>
          
          <form onSubmit={handleInventoryUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="branch-select">
                Sucursal
              </label>
              <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Seleccionar sucursal</option>
                {product.inventory.map(inv => (
                  <option key={inv.branch.id} value={inv.branch.id}>
                    {inv.branch.name} (Stock actual: {inv.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="movement-type">
                Tipo de Movimiento
              </label>
              <select
                id="movement-type"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Salida</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="quantity">
                Cantidad
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="1"
                title="Cantidad a modificar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="reason">
                Motivo
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="Ingrese el motivo del movimiento"
                title="Motivo del movimiento"
              />
            </div>

            <Button type="submit" disabled={updatingInventory}>
              {updatingInventory ? 'Actualizando...' : 'Actualizar Inventario'}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Historial de Movimientos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Anterior
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Nuevo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.inventoryMovements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(movement.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.type === 'ENTRY' ? 'Entrada' :
                     movement.type === 'EXIT' ? 'Salida' : 'Ajuste'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.previousStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.newStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {movement.branch.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;