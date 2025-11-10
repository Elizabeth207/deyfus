import { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Edit, Eye, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { post, get, put, del } = useApi();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SELLER', branchId: '' });
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterBranch, setFilterBranch] = useState<string | number | ''>('');
  const [filterActive, setFilterActive] = useState<string | number | ''>('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    // load branches
    get('/api/branches').then(res => {
      const data = Array.isArray(res?.data) ? res.data : [];
      // Deduplicar por nombre (insensible a mayúsculas) en caso el backend devuelva nombres repetidos
      const map = new Map();
      data.forEach((b: any) => {
        const key = (b.name || '').toString().trim().toLowerCase() || `id:${b.id}`;
        if (!map.has(key)) map.set(key, b);
      });
      const unique = Array.from(map.values());
      setBranches(unique);
    }).catch(() => {});
  }, [get]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterBranch) params.branchId = filterBranch;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await get('/api/users', params);
      const list = Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de usuarios' });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user && ['ADMIN', 'MANAGER'].includes(user.role)) loadUsers(); }, [get, user, filterBranch, filterActive]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    // Validaciones básicas
    if (!form.name || !form.email || !form.password) {
      return Swal.fire({ icon: 'warning', title: 'Campos faltantes', text: 'Nombre, email y contraseña son requeridos' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return Swal.fire({ icon: 'warning', title: 'Email inválido' });
    if (form.password.length < 6) return Swal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'Mínimo 6 caracteres' });

    try {
      await post('/api/auth/register', { name: form.name, email: form.email, password: form.password, role: form.role, branchId: form.branchId || undefined });
      await Swal.fire({ icon: 'success', title: 'Creado', text: 'Usuario creado correctamente' });
      setForm({ name: '', email: '', password: '', role: 'SELLER', branchId: '' });
      loadUsers();
      return true;
    } catch (err: any) {
      console.error(err);
      const message = err?.message || err?.data?.message || 'No se pudo crear el usuario';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
      return false;
    }
  };

  const handleEditOpen = (u: any) => setEditing({ ...u });

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      const payload: any = { role: editing.role, isActive: editing.isActive, branchId: editing.branchId };
      await put(`/api/users/${editing.id}`, payload);
      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Usuario actualizado' });
      setEditing(null);
      loadUsers();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo actualizar' });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: `Eliminar ${name}?`,
      text: 'Esta acción es irreversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await del(`/api/users/${id}`);
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Usuario eliminado correctamente' });
      loadUsers();
    } catch (err: any) {
      console.error(err);
      const message = err?.message || err?.data?.message || '';
      // Si el backend indica que el usuario tiene registros relacionados, ofrecer desactivarlo en lugar de eliminar
      if (String(message).toLowerCase().includes('desactívelo') || String(message).toLowerCase().includes('registros relacionados')) {
        const resp = await Swal.fire({
          title: 'No se puede eliminar',
          text: 'El usuario tiene registros relacionados. ¿Deseas desactivarlo en su lugar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, desactivar',
          cancelButtonText: 'Cancelar'
        });
        if (resp.isConfirmed) {
          try {
            await put(`/api/users/${id}`, { isActive: false });
            Swal.fire({ icon: 'success', title: 'Usuario desactivado', text: 'El usuario fue desactivado correctamente' });
            loadUsers();
            return;
          } catch (e: any) {
            console.error('Error deactivating user', e);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo desactivar el usuario' });
            return;
          }
        }
      }
      Swal.fire({ icon: 'error', title: 'Error', text: message || 'No se pudo eliminar usuario' });
    }
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await get(`/api/users/${id}`);
      setDetail(res?.data ?? null);
    } catch (err) {
      Swal.fire('Error', 'No se pudo obtener detalle', 'error');
    }
  };

  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) return <div className="p-6">Acceso denegado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Usuarios
          </h1>
          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <UserPlus size={16} className="text-indigo-500" />
            Gestión de usuarios del sistema — crea, edita y administra permisos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <select 
              aria-label="Filtrar por sucursal" 
              value={filterBranch} 
              onChange={e => setFilterBranch(e.target.value)} 
              className="pl-4 pr-10 py-2.5 w-full sm:w-64 border border-slate-200 rounded-xl bg-slate-50/50
                focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
            >
              <option value="">Todas las sucursales</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-4 h-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative">
            <select
              aria-label="Filtrar por estado"
              value={filterActive}
              onChange={e => setFilterActive(e.target.value)}
              className="pl-4 pr-10 py-2.5 w-full sm:w-44 border border-slate-200 rounded-xl bg-slate-50/50
                focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-4 h-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <button 
            onClick={loadUsers} 
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium
              hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>
          <button 
            onClick={() => setShowCreate(true)} 
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium
              hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 
              hover:shadow-indigo-500/35 inline-flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            <span>Crear usuario</span>
          </button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-current border-t-transparent text-indigo-600 opacity-75"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u.id} className={`relative group bg-white rounded-xl overflow-hidden border border-slate-100 transition-all duration-300 ${u.isActive ? 'shadow-sm hover:shadow-md' : 'shadow-sm opacity-90'}`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-medium text-white shadow-lg shadow-indigo-500/25">
                      {u.name ? String(u.name).split(' ').map((x: string) => x[0]).slice(0,2).join('') : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-800 truncate">{u.name}</h3>
                        <div className={`px-2 py-0.5 text-xs font-medium rounded-full 
                          ${u.isActive 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          • {u.isActive ? 'Activo' : 'Inactivo'}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-slate-600 truncate">{u.email}</div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center px-3 py-2 bg-slate-50/80 rounded-lg">
                          <span className="text-xs text-slate-500">Rol</span>
                          <span className="font-medium text-sm mt-0.5 text-slate-700">{u.role}</span>
                        </div>
                        <div className="flex flex-col items-center px-3 py-2 bg-slate-50/80 rounded-lg">
                          <span className="text-xs text-slate-500">Sucursal</span>
                          <span className="font-medium text-sm mt-0.5 text-slate-700 truncate">
                            {(branches.find(b => Number(b.id) === Number(u.branchId))?.name) ?? '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleOpenDetail(u.id)}
                          title="Ver detalles" 
                          className="flex-1 px-3 py-2 text-slate-600 bg-white border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          <span>Ver</span>
                        </button>
                        <button 
                          onClick={() => handleEditOpen(u)}
                          title="Editar usuario" 
                          className="flex-1 px-3 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all inline-flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          <span>Editar</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id, u.name)}
                          title="Eliminar usuario"
                          className="px-3 py-2 text-red-600 bg-white border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Eliminar usuario</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <UserPlus size={24} />
                </div>
                <p className="text-slate-600 font-medium">No hay usuarios registrados</p>
                <p className="text-slate-500 text-sm mt-1">Crea un nuevo usuario para empezar</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Crear usuario</h3>
            <form onSubmit={async (e) => { const ok = await handleCreate(e); if (ok) setShowCreate(false); }} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Nombre</label>
                <input placeholder="Nombre completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Contraseña</label>
                <input placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Rol</label>
                  <select aria-label="Rol" title="Rol" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1">
                    {user?.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                    <option value="MANAGER">MANAGER</option>
                    <option value="SELLER">SELLER</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Sucursal (opcional)</label>
                  <select aria-label="Sucursal" title="Sucursal" value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1">
                    <option value="">Sin asignar</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded-md text-slate-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow">Crear usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Editar usuario</h3>
            <div className="space-y-3">
              <div className="text-sm text-slate-600">{editing.name} · <span className="text-slate-500">{editing.email}</span></div>
              <div>
                <label className="block text-sm text-slate-600">Rol</label>
                <select aria-label="Rol" value={editing.role} onChange={e => setEditing((s: any) => ({ ...s, role: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-md mt-1">
                  {user?.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                  <option value="MANAGER">MANAGER</option>
                  <option value="SELLER">SELLER</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600">Sucursal</label>
                <select aria-label="Sucursal" value={editing.branchId ?? ''} onChange={e => setEditing((s: any) => ({ ...s, branchId: e.target.value ? Number(e.target.value) : null }))} className="w-full p-2 border border-slate-200 rounded-md mt-1">
                  <option value="">Sin sucursal</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={editing.isActive} onChange={e => setEditing((s: any) => ({ ...s, isActive: e.target.checked }))} className="form-checkbox h-4 w-4 text-indigo-600" />
                  <span className="ml-2 text-sm text-slate-700">Activo</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditing(null)} className="px-3 py-2 border rounded-md text-slate-700">Cancelar</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl max-w-lg w-full shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{detail.user.name}</h3>
                <div className="text-sm text-slate-500 mt-1">{detail.user.email} · Último acceso: {detail.user.lastLogin ? new Date(detail.user.lastLogin).toLocaleString() : '—'}</div>
              </div>
              <div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${detail.user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{detail.user.isActive ? 'Activo' : 'Inactivo'}</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Ventas recientes</h4>
              {Array.isArray(detail.recentSales) && detail.recentSales.length > 0 ? (
                <ul className="space-y-2">
                  {detail.recentSales.map((s: any) => (
                    <li key={s.id} className="p-2 border rounded flex justify-between items-center">
                      <div className="text-sm text-slate-600">Venta {s.id} · {new Date(s.createdAt).toLocaleString()}</div>
                      <div className="font-semibold text-slate-800">S/. {Number(s.total).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              ) : <div className="text-sm text-slate-500">Sin ventas recientes</div>}
            </div>

            <div className="flex justify-end mt-4"><button onClick={() => setDetail(null)} className="px-3 py-2 border rounded-md text-slate-700">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
