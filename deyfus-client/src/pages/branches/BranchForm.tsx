import { Store, MapPin, Phone } from 'lucide-react';

interface BranchFormProps {
  form: {
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
  };
  editing: any | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (form: any) => void;
}

export default function BranchForm({ form, editing, onSubmit, onCancel, onChange }: BranchFormProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl animate-slideUp">
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

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-slate-400" />
                    <span>Nombre de Sucursal</span>
                  </div>
                </label>
                <input 
                  placeholder="Ej: Sucursal Centro" 
                  value={form.name} 
                  onChange={e => onChange({ ...form, name: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                    focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>Dirección</span>
                  </div>
                </label>
                <input 
                  placeholder="Ej: Av. Principal #123" 
                  value={form.address} 
                  onChange={e => onChange({ ...form, address: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                    focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

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
                  onChange={e => onChange({ ...form, phone: e.target.value })} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50
                    focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                <label className="flex items-center gap-3">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={form.isActive} 
                      onChange={e => onChange({ ...form, isActive: e.target.checked })}
                      className="w-5 h-5 border-2 border-slate-300 rounded checked:border-emerald-500 
                        checked:bg-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Sucursal activa</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={onCancel}
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
  );
}