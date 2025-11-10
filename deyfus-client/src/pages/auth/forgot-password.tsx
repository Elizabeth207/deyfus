import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from "@/components/ui/label";
import { Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body?.message || 'Error al enviar correo de recuperación');
        await Swal.fire({ icon: 'error', title: 'Error', text: body?.message || 'Error al enviar correo de recuperación' });
        return;
      }
      await Swal.fire({ icon: 'success', title: 'Enviado', text: 'Revisa tu correo para las instrucciones.', timer: 1200, showConfirmButton: false });
      setSuccess(true);
    } catch (err) {
      setError('Error al enviar el correo de recuperación. Por favor, intenta de nuevo.');
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Error al enviar el correo de recuperación. Por favor, intenta de nuevo.' });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-stretch">
        <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
          <svg className="absolute -right-20 top-10 opacity-20" width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <g transform="rotate(-20 300 300)">
              <rect x="50" y="50" width="180" height="80" rx="40" fill="rgba(255,255,255,0.1)" />
              <rect x="120" y="140" width="280" height="120" rx="60" fill="rgba(255,255,255,0.08)" />
              <rect x="220" y="260" width="300" height="140" rx="70" fill="rgba(255,255,255,0.06)" />
            </g>
          </svg>

          <div className="relative z-10 h-full flex flex-col justify-center pl-24 pr-12 text-white">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4">Welcome to Deyfus</h1>
            <p className="max-w-xl text-lg text-white/90">Administra tu tienda con una interfaz rápida y profesional.</p>
          </div>

          <div className="absolute bottom-12 left-12 z-10 text-white/80">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">Deyfus</div>
                <div className="text-xs text-white/70">Calzados — Estilo y confort</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-5/12 flex items-stretch">
          <div className="w-full h-full flex flex-col justify-center px-8 lg:px-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Revisa tu correo</h2>
              <p className="text-sm text-gray-600 mt-1">Te enviamos instrucciones para restablecer tu contraseña.</p>
            </div>
            <div className="max-w-md mx-auto w-full p-6 bg-white rounded-lg shadow">
              <div className="text-center">
                <Mail className="mx-auto mb-4 w-12 h-12 text-gray-900" />
                <p className="text-gray-700">Hemos enviado las instrucciones al correo que proporcionaste.</p>
                <div className="mt-6">
                  <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">Volver al inicio</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-stretch">
      {/* Left big graphic panel - takes ~65% on desktop */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
        <svg className="absolute -right-20 top-10 opacity-20" width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <g transform="rotate(-20 300 300)">
            <rect x="50" y="50" width="180" height="80" rx="40" fill="rgba(255,255,255,0.1)" />
            <rect x="120" y="140" width="280" height="120" rx="60" fill="rgba(255,255,255,0.08)" />
            <rect x="220" y="260" width="300" height="140" rx="70" fill="rgba(255,255,255,0.06)" />
          </g>
        </svg>

        <div className="relative z-10 h-full flex flex-col justify-center pl-24 pr-12 text-white">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4">Welcome to Deyfus</h1>
          <p className="max-w-xl text-lg text-white/90">Administra tu tienda de calzados con una interfaz rápida, clara y profesional. Controla inventario, ventas y reportes en un solo lugar.</p>
        </div>

        <div className="absolute bottom-12 left-12 z-10 text-white/80">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium">Deyfus</div>
              <div className="text-xs text-white/70">Calzados — Estilo y confort</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form panel - takes ~35% and is flush to right */}
      <div className="w-full lg:w-5/12 flex items-stretch">
        <div className="w-full h-full flex flex-col justify-center px-8 lg:px-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recupera tu contraseña</h2>
            <p className="text-sm text-gray-600 mt-1">Ingresa el correo asociado a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
              <div className="relative mt-2">
                <input id="email" type="email" {...register('email')} placeholder="tucorreo@ejemplo.com" className={`w-full pl-4 pr-3 py-3 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 ${errors.email ? 'border-red-400' : ''}`} />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {error && (<div className="text-sm text-red-600 text-center">{error}</div>)}

            <div>
              <button type="submit" className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-900">{isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}</button>
            </div>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => navigate('/login')} className="text-gray-600 hover:underline">Volver al inicio de sesión</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}