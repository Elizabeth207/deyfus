import { useEffect, useState } from 'react';
import { useApi } from '@/lib/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { PlusCircle, Edit, Trash2, MapPin, Phone, Calendar, Store, Users, Package, ShoppingCart, Clock, Eye } from 'lucide-react';
import BranchInventory from './BranchInventory';
import BranchInsights from './BranchInsights';

export default function BranchesPage() {
  const { get, post, put, del } = useApi();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerId: null as number | null,
    openingHours: '',
    latitude: '',
    longitude: '',
    logoUrl: '',
    notes: '',
    taxId: '',
    taxRate: '',
    isActive: true
  });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview'|'inventory'|'insights'|'staff'|'finances'|'reports'>('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter === 'active' ? 'active' : 'inactive';
      const res = await get('/api/branches', params);
      const data = Array.isArray(res?.data) ? res.data : [];
      setBranches(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar las sucursales' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleSubmit = async (e?: any) => {
    e?.preventDefault();
    if (!form.name || !form.address) return Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Nombre y dirección son obligatorios' });
    try {
      if (editing) {
        await put(`/api/branches/${editing.id}`, {
          name: form.name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          managerId: form.managerId,
          openingHours: form.openingHours,
          latitude: form.latitude,
          longitude: form.longitude,
          logoUrl: form.logoUrl,
          notes: form.notes,
          taxId: form.taxId,
          taxRate: form.taxRate,
          isActive: form.isActive
        });
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Sucursal actualizada correctamente' });
      } else {
        await post('/api/branches', {
          name: form.name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          managerId: form.managerId,
          openingHours: form.openingHours,
          latitude: form.latitude,
          longitude: form.longitude,
          logoUrl: form.logoUrl,
          notes: form.notes,
          taxId: form.taxId,
          taxRate: form.taxRate,
          isActive: form.isActive
        });
        Swal.fire({ icon: 'success', title: 'Creada', text: 'Sucursal creada correctamente' });
      }
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        managerId: null,
        openingHours: '',
        latitude: '',
        longitude: '',
        logoUrl: '',
        notes: '',
        taxId: '',
        taxRate: '',
        isActive: true
      });
      setEditing(null);
      setShowModal(false);
      load();
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo guardar' });
    }
  };

  const handleEdit = (b: any) => {
    setEditing(b);
    setForm({
      name: b.name || '',
      address: b.address || '',
      phone: b.phone || '',
      email: b.email || '',
      managerId: b.managerId ?? null,
      openingHours: b.openingHours || '',
      latitude: b.latitude ?? '',
      longitude: b.longitude ?? '',
      logoUrl: b.logoUrl || '',
      notes: b.notes || '',
      taxId: b.taxId || '',
      taxRate: b.taxRate ?? '',
      isActive: !!b.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (b: any) => {
    const r = await Swal.fire({ title: 'Eliminar sucursal', text: `¿Eliminar ${b.name}?`, icon: 'warning', showCancelButton: true });
    if (!r.isConfirmed) return;
    try {
      await del(`/api/branches/${b.id}`);
      Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Sucursal eliminada' });
      load();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo eliminar' });
    }
  };

  const toggleActive = async (b: any) => {
    try {
      await put(`/api/branches/${b.id}`, { isActive: !b.isActive });
      Swal.fire({ icon: 'success', title: b.isActive ? 'Desactivada' : 'Activada', text: `Sucursal ${b.isActive ? 'desactivada' : 'activada'} correctamente` });
      load();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo actualizar el estado' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sucursales
          </h1>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Store size={16} className="text-blue-500" />
            Gestión centralizada de sucursales y puntos de venta
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Buscar sucursal..." 
              className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-slate-200 rounded-xl bg-slate-50/50 
                focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <select 
            aria-label="Filtro de estado" 
            title="Filtro de estado" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)} 
            className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todas las sucursales</option>
            <option value="active">Sucursales activas</option>
            <option value="inactive">Sucursales inactivas</option>
          </select>
          <button 
            onClick={() => { 
                    setEditing(null); 
                    setForm({
                      name: '',
                      address: '',
                      phone: '',
                      email: '',
                      managerId: null,
                      openingHours: '',
                      latitude: '',
                      longitude: '',
                      logoUrl: '',
                      notes: '',
                      taxId: '',
                      taxRate: '',
                      isActive: true
                    }); 
                    setShowModal(true); 
                  }} 
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
              flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 
              transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35"
          >
            <PlusCircle size={20} />
            <span className="font-medium">Nueva Sucursal</span>
          </button>
        </div>
      </div>

      {/* Descripción: se eliminó la barra de pestañas para mantener una UI más limpia (sidebar ya provee navegación). */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">Lista de sucursales — administra, edita y accede a cada punto de venta desde aquí.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-current border-t-transparent text-blue-600 opacity-75"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando sucursales...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Store size={24} />
            </div>
            <p className="text-slate-600 font-medium">No hay sucursales registradas</p>
            <p className="text-slate-500 text-sm mt-1">Crea una nueva sucursal para empezar</p>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(b => (
                  <div key={b.id} className="group relative bg-white hover:bg-gradient-to-b hover:from-white hover:to-slate-50/80 rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="p-5 relative">
                      <div className="flex items-start gap-4">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt={b.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all duration-300" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:from-blue-600 group-hover:to-indigo-700 flex items-center justify-center text-white text-lg font-medium shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                            {b.name ? String(b.name).split(' ').map((x:string)=>x[0]).slice(0,2).join('') : 'S'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{b.name}</h3>
                            <div className={`px-2 py-0.5 text-xs font-medium rounded-full 
                              ${b.isActive 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                              • {b.isActive ? 'Activa' : 'Inactiva'}
                            </div>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate">{b.address}</span>
                            </div>
                            {b.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone size={14} className="text-gray-400" />
                                <span>{b.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <div className="flex flex-col items-center px-3 py-2 bg-gradient-to-br from-slate-50 to-white rounded-lg group-hover:from-blue-50/50 group-hover:to-white transition-colors duration-300">
                            <Package size={16} className="mb-1 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                            <span className="block font-medium text-sm text-slate-700 group-hover:text-slate-900">{b._count?.products ?? 0}</span>
                            <span className="block text-xs text-slate-500">Productos</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex flex-col items-center px-3 py-2 bg-gradient-to-br from-slate-50 to-white rounded-lg group-hover:from-blue-50/50 group-hover:to-white transition-colors duration-300">
                            <ShoppingCart size={16} className="mb-1 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                            <span className="block font-medium text-sm text-slate-700 group-hover:text-slate-900">{b._count?.sales ?? 0}</span>
                            <span className="block text-xs text-slate-500">Ventas</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex flex-col items-center px-3 py-2 bg-gradient-to-br from-slate-50 to-white rounded-lg group-hover:from-blue-50/50 group-hover:to-white transition-colors duration-300">
                            <Users size={16} className="mb-1 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                            <span className="block font-medium text-sm text-slate-700 group-hover:text-slate-900">{b._count?.users ?? 0}</span>
                            <span className="block text-xs text-slate-500">Usuarios</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 group-hover:border-slate-200 transition-colors">
                        <button onClick={() => handleEdit(b)} 
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg 
                            hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40
                            hover:scale-[1.02] active:scale-[0.98]">
                          <span className="flex items-center justify-center gap-2">
                            <Edit size={16} className="group-hover:animate-pulse" />
                            Editar
                          </span>
                        </button>
                        <button onClick={() => toggleActive(b)}
                          className="flex-1 px-4 py-2 text-blue-600 bg-white border border-blue-200 text-sm font-medium rounded-lg 
                            hover:bg-blue-50/80 hover:border-blue-300 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          {b.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button 
                          onClick={() => handleDelete(b)}
                          title="Eliminar sucursal"
                          className="px-4 py-2 text-red-600 bg-white border border-red-200 text-sm font-medium rounded-lg 
                            hover:bg-red-50/80 hover:border-red-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Trash2 size={16} className="group-hover:animate-bounce" />
                          <span className="sr-only">Eliminar sucursal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                {branches.map(b => (
                  <div key={b.id} className="p-4 bg-white rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-sm text-slate-500">Productos totales: {b._count?.products ?? 0}</div>
                      </div>
                      <button className="text-sm px-3 py-2 bg-slate-50 rounded-lg">Ver inventario</button>
                    </div>
                    {/* Renderiza resumen de inventario (placeholder) */}
                    <BranchInventory inventory={[] as any} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                {/* Muestra insights por sucursal */}
                {branches.map(b => {
                  const salesPerDay = Array(7).fill(Math.round((b._count?.sales ?? 0) / 7));
                  const stats = {
                    salesByDay: salesPerDay,
                    stockAlerts: b._count?.stockAlerts ?? 0,
                    topProducts: [{ name: '—', sales: 0 }],
                    staffActivity: (b.users || []).map((u:any) => ({ name: u.name, sales: Math.floor(Math.random() * 5) }))
                  };
                  return (
                    <div key={b.id} className="p-4 bg-white rounded-xl shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">Insights - {b.name}</div>
                        <div className="text-sm text-slate-500">Ventas totales: {b._count?.sales ?? 0}</div>
                      </div>
                      <BranchInsights id={b.id} stats={stats as any} />
                    </div>
                  );
                })}
              </div>
            )}

            {['staff','finances','reports'].includes(activeTab) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map(b => (
                  <div key={b.id} className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-sm text-slate-500 mt-1">Usuarios: {b._count?.users ?? 0} • Alertas: {b._count?.stockAlerts ?? 0}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-slate-50 rounded-lg">Ver</button>
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">Acceder</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-5xl w-full mx-4 shadow-2xl animate-slideUp">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h3>
                  <p className="text-sm text-slate-500">Completa la información de la sucursal</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel Izquierdo */} 
                  <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-medium text-slate-800 mb-3 pb-2 border-b">Información Principal</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-slate-400" />
                          <span>Nombre de Sucursal*</span>
                        </div>
                      </label>
                      <input 
                        placeholder="Ej: Sucursal Centro" 
                        value={form.name} 
                        required
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400" />
                          <span>Dirección*</span>
                        </div>
                      </label>
                      <input 
                        placeholder="Ej: Av. Principal #123" 
                        value={form.address}
                        required 
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-slate-400" />
                            <span>Teléfono</span>
                          </div>
                        </label>
                        <input 
                          placeholder="Teléfono (opcional)" 
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                          placeholder="correo@ejemplo.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <span>Horario de atención</span>
                        </div>
                      </label>
                      <input 
                        placeholder="Ej: Lun-Vie 09:00-18:00"
                        value={form.openingHours}
                        onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">RUC / Tax ID</label>
                        <input
                          placeholder="RUC o ID fiscal"
                          value={form.taxId}
                          onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tasa de impuesto (%)</label>
                        <input
                          placeholder="18"
                          value={form.taxRate}
                          onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <label className="flex items-center gap-3">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={form.isActive} 
                            onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                            className="w-5 h-5 border-2 border-slate-300 rounded checked:border-emerald-500 
                              checked:bg-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Sucursal activa</span>
                      </label>
                    </div>
                  </div>

                  {/* Panel Derecho */}
                  <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-medium text-slate-800 mb-3 pb-2 border-b">Información Adicional</h4>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Encargado (ID)</label>
                      <input
                        placeholder="ID del manager (opcional)"
                        value={form.managerId ?? ''}
                        onChange={e => setForm(f => ({ ...f, managerId: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitud</label>
                        <input
                          placeholder="-12.0464"
                          value={form.latitude}
                          onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitud</label>
                        <input
                          placeholder="-77.0428"
                          value={form.longitude}
                          onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                            focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo (URL)</label>
                      <input
                        placeholder="https://.../logo.png"
                        value={form.logoUrl}
                        onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
                      <textarea
                        placeholder="Notas internas o ubicación detallada"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 resize-none h-24
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setShowModal(false); 
                      setEditing(null); 
                      setForm({
                        name: '',
                        address: '',
                        phone: '',
                        email: '',
                        managerId: null,
                        openingHours: '',
                        latitude: '',
                        longitude: '',
                        logoUrl: '',
                        notes: '',
                        taxId: '',
                        taxRate: '',
                        isActive: true
                      });
                    }} 
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium
                      hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium
                      hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 
                      hover:shadow-blue-500/35"
                  >
                    {editing ? 'Actualizar' : 'Crear'} sucursal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
