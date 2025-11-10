import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from "@/components/ui/label";
// Using native inputs and buttons styled with Tailwind in this page
import { UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      const payload = { name: data.name, email: data.email, password: data.password };
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body?.message || 'Error al registrar');
        await Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: body?.message || 'Error al registrar',
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Registrado',
        text: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
        timer: 1400,
        showConfirmButton: false,
      });
      navigate('/login');
    } catch (err) {
      setError('Error al registrar usuario. Por favor, intenta de nuevo.');
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al registrar usuario. Por favor, intenta de nuevo.',
      });
    }
  };

  return (
    <div className="h-screen w-full flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] items-center justify-center p-8">
        <div className="max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-800/60 rounded-full border border-gray-700">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Deyfus</h1>
              <p className="text-sm text-gray-400">Calzados — Empodera tu tienda</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Crea tu cuenta y administra ventas, sucursales y stock con una interfaz clara y profesional.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear cuenta en Deyfus</h2>
            <p className="text-sm text-gray-600 mt-2">
              Únete y administra tu tienda de calzados
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <div className="mt-2">
                <input
                  id="name"
                  {...register('name')}
                  placeholder="Tu nombre"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="tucorreo@ejemplo.com"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white h-10 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>

            <p className="text-sm text-gray-600 text-center">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-gray-900 hover:underline font-medium"
              >
                Iniciar sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}