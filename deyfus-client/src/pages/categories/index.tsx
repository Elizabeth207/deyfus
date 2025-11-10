import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { useApi } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const api = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await api.post('/categories', { name: newCategory });
      setNewCategory("");
      await loadCategories();
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;

    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditingId(null);
      setEditName("");
      await loadCategories();
    } catch (error) {
      console.error('Error actualizando categoría:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await api.del(`/categories/${id}`);
      await loadCategories();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleCreate} className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="newCategory">Nueva categoría</Label>
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>
          <Button type="submit" className="self-end">
            Agregar
          </Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>
                    {editingId === category.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(category.id);
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditName("");
                          }
                        }}
                        placeholder="Nombre de la categoría"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      {editingId === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(category.id)}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditName("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditName(category.name);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-6 text-muted-foreground">
                    No hay categorías registradas
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}