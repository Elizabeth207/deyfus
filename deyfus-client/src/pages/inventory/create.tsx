import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useApi } from "@/lib/api";
import type { Product, Branch } from "@/lib/types";

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const api = useApi();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '',
    quantity: '',
    minStock: '',
    maxStock: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, branchesRes] = await Promise.all([
        api.getProducts(),
        api.getBranches()
      ]);
      setProducts(productsRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await api.createInventory({
        productId: Number(formData.productId),
        branchId: Number(formData.branchId),
        quantity: Number(formData.quantity),
        minStock: Number(formData.minStock),
        maxStock: formData.maxStock ? Number(formData.maxStock) : null
      });
      
      navigate('/dashboard/inventory');
    } catch (error) {
      console.error('Error creando inventario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Crear Inventario</h1>
        <Button 
          variant="outline"
          onClick={() => navigate('/inventory')}
        >
          Cancelar
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="productId">Producto</Label>
            <Select
              id="productId"
              value={formData.productId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('productId', e.target.value)}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="branchId">Sucursal</Label>
            <Select
              id="branchId"
              value={formData.branchId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('branchId', e.target.value)}
              required
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map(branch => (
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
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="minStock">Stock mínimo</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              value={formData.minStock}
              onChange={(e) => handleChange('minStock', e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Se generará una alerta cuando el stock sea menor o igual a este valor
            </p>
          </div>

          <div>
            <Label htmlFor="maxStock">Stock máximo</Label>
            <Input
              id="maxStock"
              type="number"
              min="0"
              value={formData.maxStock}
              onChange={(e) => handleChange('maxStock', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Opcional. Se generará una alerta cuando el stock supere este valor
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline" 
              onClick={() => navigate('/inventory')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              Crear inventario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}