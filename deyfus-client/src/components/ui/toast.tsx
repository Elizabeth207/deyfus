import { Toaster, toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const toast = {
  success: (message: string, options?: ToastOptions) => hotToast.success(message, options),
  error: (message: string, options?: ToastOptions) => hotToast.error(message, options),
  loading: (message: string, options?: ToastOptions) => hotToast.loading(message, options),
};

export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          duration: 3000,
          style: {
            background: '#22c55e',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#22c55e',
          },
        },
        error: {
          duration: 3000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
      }}
    />
  );
}