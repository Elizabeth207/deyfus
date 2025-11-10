import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function SettingsPage() {
  const { user, token, login } = useAuth();

  const promoteToAdmin = async () => {
    const result = await Swal.fire({
      title: 'Promover a administrador',
      text: `¿Deseas convertir a ${user?.name || 'este usuario'} en Administrador?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, promover',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    const updatedUser = { ...(user as any), role: 'ADMIN' };
    // update context and localStorage via login
    login(updatedUser as any, token || '');

    await Swal.fire('Listo', `${updatedUser.name} ahora es Administrador`, 'success');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configuración</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm min-h-[200px]">
        <div className="mb-4">Usuario autenticado: <strong>{user?.name}</strong></div>
        <div className="text-sm text-gray-500 mb-4">Aquí irán las opciones de configuración del sistema.</div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Administración</h3>
          <p className="text-sm text-gray-600 mb-3">Promover al usuario actual a Administrador (esto actualizará el rol en la sesión).</p>
          <button onClick={promoteToAdmin} className="px-4 py-2 bg-black text-white rounded">Promover a Administrador</button>
        </div>
      </div>
    </div>
  );
}
