import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from "@/components/ui/label";
// Using native inputs and buttons styled with Tailwind in this page
import { ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body?.message || 'Credenciales inválidas');
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: body?.message || 'Credenciales inválidas',
        });
        return;
      }

      if (body.token && body.user) {
        login(body.user, body.token);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Has iniciado sesión como ${body.user.name}`,
        timer: 1200,
        showConfirmButton: false,
      });
      const role = body.user?.role;
      if (role === 'ADMIN') navigate('/dashboard/branches');
      else if (role === 'MANAGER') navigate('/dashboard/finance');
      else navigate('/dashboard/sales');
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-stretch">
      {/* Left big graphic panel - takes ~65% on desktop */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
        {/* Decorative shapes */}
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
              <ShoppingBag className="w-6 h-6 text-white" />
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
            <h2 className="text-3xl font-bold text-gray-900">Inicia sesión</h2>
            <p className="text-sm text-gray-600 mt-1">Accede a tu panel de administración</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
              <div className="relative mt-2">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="tucorreo@ejemplo.com"
                  className={`w-full pl-4 pr-3 py-3 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="********"
                  className={`w-full pl-4 pr-3 py-3 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 ${errors.password ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-gray-800 hover:text-black hover:underline">¿Olvidaste tu contraseña?</button>
              <button type="button" onClick={() => navigate('/register')} className="text-gray-800 hover:text-black hover:underline">Crear cuenta</button>
            </div>

            {error && (<div className="text-sm text-red-600 text-center">{error}</div>)}

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-900 transition">
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">¿Necesitas ayuda? Escríbenos a <span className="text-gray-800 hover:text-black">soporte@deyfus.example</span></div>
        </div>
      </div>
    </div>
  );
}