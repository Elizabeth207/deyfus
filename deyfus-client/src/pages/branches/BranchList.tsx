import { MapPin, Phone, Package, ShoppingCart, Users, Edit, Trash2 } from 'lucide-react';

interface BranchListProps {
  branches: any[];
  onEdit: (branch: any) => void;
  onToggleActive: (branch: any) => void;
  onDelete: (branch: any) => void;
}

export default function BranchList({ branches, onEdit, onToggleActive, onDelete }: BranchListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map(b => (
        <div key={b.id} className="p-4 bg-gradient-to-br from-white to-slate-50 border rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                {b.name ? String(b.name).split(' ').map((x:string)=>x[0]).slice(0,2).join('') : 'S'}
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-lg">{b.name}</div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                    <MapPin size={14} className="text-slate-600" />
                    <span>{b.address}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-500 mt-1.5 flex items-center gap-2">
                  {b.phone ? (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                      <Phone size={14} className="text-slate-600" />
                      <span>{b.phone}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">Sin teléfono registrado</div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${b.isActive 
                  ? 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200' 
                  : 'bg-rose-100 text-rose-800 group-hover:bg-rose-200'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                {b.isActive ? 'Activa' : 'Inactiva'}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-600">
                  <Package size={14} className="text-slate-400" />
                  <span>Productos:</span>
                  <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded">{b._count?.products ?? 0}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-600">
                  <ShoppingCart size={14} className="text-slate-400" />
                  <span>Ventas:</span>
                  <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded">{b._count?.sales ?? 0}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  <span>Usuarios:</span>
                  <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded">{b._count?.users ?? 0}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 mt-1">
                Creada: {new Date(b.createdAt).toLocaleDateString('es')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <button onClick={() => onEdit(b)} 
              className="col-span-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg 
                flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-blue-700 transition-all
                shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
              <Edit size={16} />
              <span>Editar</span>
            </button>
            <button onClick={() => onToggleActive(b)} 
              className={`px-3 py-2 rounded-lg flex items-center justify-center transition-colors
                ${b.isActive 
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {b.isActive ? 'Desactivar' : 'Activar'}
            </button>
            <button 
              onClick={() => onDelete(b)}
              title="Eliminar sucursal"
              aria-label={`Eliminar sucursal ${b.name}`}
              className="px-3 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg 
                flex items-center justify-center gap-2 hover:from-rose-600 hover:to-rose-700
                transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}