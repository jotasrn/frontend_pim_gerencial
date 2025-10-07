import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Configuração personalizada dos toasts
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <CheckCircle className="w-5 h-5" />,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <XCircle className="w-5 h-5" />,
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <AlertCircle className="w-5 h-5" />,
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <Info className="w-5 h-5" />,
    });
  },
};

// Componente Toaster para ser usado no App
export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }}
    />
  );
};