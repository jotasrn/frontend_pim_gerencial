import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, TipoUsuario } from '../contexts/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  permissaoRequerida?: TipoUsuario;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissaoRequerida
}) => {
  const { usuario, carregando, verificarPermissao } = useAuth();

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (permissaoRequerida && !verificarPermissao(permissaoRequerida)) {
    switch (usuario.permissao) {
      case 'gerente':
        return <Navigate to="/gerente" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};