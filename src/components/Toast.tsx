import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Função auxiliar para criar um toast customizado
const customToast = (message: string, icon: React.ReactNode, backgroundColor: string) => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center px-4 py-3 text-white rounded-lg shadow-lg transition-all duration-300 ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
        style={{ background: backgroundColor }}
      >
        <div className="mr-3">{icon}</div>
        <span>{message}</span>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};

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
      },
      icon: <XCircle className="w-5 h-5" />,
    });
  },

  warning: (message: string) => {
    customToast(message, <AlertCircle className="w-5 h-5" />, '#F59E0B');
  },

  info: (message: string) => {
    customToast(message, <Info className="w-5 h-5" />, '#3B82F6');
  },
};

// Componente Toaster para ser usado no App
export const ToastContainer: React.FC = () => {
  return <Toaster position="top-right" reverseOrder={false} gutter={8} />;
};