import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApi } from '@/lib/api';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  sku: string;
}

interface Branch {
  id: number;
  name: string;
}

export default function NewInventoryPage() {
  const navigate = useNavigate();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesRes, productsRes] = await Promise.all([
          api.getBranches(),
          api.getProducts()
        ]);
        
        setBranches(branchesRes.data || []);
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos necesarios',
          confirmButtonColor: '#EF4444'
        });
      }
    };

    loadData();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Validación de datos
      const productId = Number(formData.get('productId'));
      const branchId = Number(formData.get('branchId')); 
      const quantity = Number(formData.get('quantity'));
      const minStock = Number(formData.get('minStock'));
      const maxStock = formData.get('maxStock') ? Number(formData.get('maxStock')) : null;
      const location = formData.get('location')?.toString().trim() || null;

      // Validaciones mejoradas con mensajes más descriptivos
      const validations = [
        {
          condition: !productId,
          message: 'Por favor selecciona un producto para el inventario'
        },
        {
          condition: !branchId, 
          message: 'Por favor selecciona una sucursal para el inventario'
        },
        {
          condition: quantity < 0,
          message: 'El stock inicial debe ser un número mayor o igual a cero'
        },
        {
          condition: minStock < 0,
          message: 'El stock mínimo debe ser un número mayor o igual a cero'
        },
        {
          condition: maxStock !== null && maxStock < minStock,
          message: 'El stock máximo debe ser mayor que el stock mínimo'
        },
        {
          condition: maxStock !== null && maxStock < quantity,
          message: 'El stock máximo debe ser mayor que el stock inicial'
        },
        {
          condition: maxStock !== null && maxStock === 0,
          message: 'El stock máximo debe ser mayor que cero'
        }
      ];

      const error = validations.find(v => v.condition);
      if (error) {
        throw new Error(error.message);
      }

      const data = {
        productId,
        branchId,
        quantity,
        minStock,
        maxStock,
        location
      };

      await api.createInventory(data);
      
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El inventario se ha creado correctamente',
        showConfirmButton: true,
        confirmButtonText: 'Ver listado de inventario',
        confirmButtonColor: '#10B981',
        background: '#fff',
        iconColor: '#10B981',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100',
          title: 'text-2xl font-semibold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'text-sm font-medium'
        },
        // Mejora visual de la animación
        showClass: {
          popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut'
        }
      });

      navigate('/inventory');
    } catch (error) {
      console.error('Error al crear inventario:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al crear inventario',
        text: error instanceof Error ? error.message : 'No se pudo crear el inventario. Por favor verifica los datos e intenta nuevamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-gray-100',
          title: 'text-xl font-medium text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'text-sm font-medium'
        },
        // Mejora visual de la animación para errores
        showClass: {
          popup: 'animate__animated animate__headShake'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmExit = useCallback(() => {
    Swal.fire({
      title: '¿Deseas cancelar?',
      text: "Se perderán todos los datos ingresados",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, salir sin guardar',
      cancelButtonText: 'Continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/inventory');
      }
    });
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-2xl mx-auto shadow-sm">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Crear Inventario</h1>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/inventory')}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6" noValidate>

          <div className="space-y-5">
            <div>
              <Label htmlFor="productId">Producto</Label>
              <Select
                id="productId"
                name="productId"
                required
                defaultValue=""
                className="mt-1.5 w-full"
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.sku}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="branchId">Sucursal</Label>
              <Select
                id="branchId"
                name="branchId"
                required
                defaultValue=""
                className="mt-1.5 w-full"
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad inicial</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                required
                min="0"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                required
                min="0"
                className="mt-1.5"
              />
              <p className="mt-1 text-sm text-gray-500">
                Se generará una alerta cuando el stock sea menor o igual a este valor
              </p>
            </div>

            <div>
              <Label htmlFor="maxStock">Stock máximo</Label>
              <Input
                id="maxStock"
                name="maxStock"
                type="number"
                min="0"
                className="mt-1.5"
              />
              <p className="mt-1 text-sm text-gray-500">
                Opcional. Se generará una alerta cuando el stock supere este valor
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2"
            >
              {isLoading ? 'Guardando...' : 'Crear inventario'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}