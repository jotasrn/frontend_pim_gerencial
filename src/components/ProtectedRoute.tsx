import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, TipoUsuario } from '../contexts/AuthContext'; 
// A interface agora usa 'permissaoRequerida'
interface ProtectedRouteProps {
  children: React.ReactNode;
  permissaoRequerida?: TipoUsuario;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permissaoRequerida 
}) => {
  // Usamos as variáveis em português do nosso hook
  const { usuario, carregando, verificarPermissao } = useAuth();

  // Mostra um spinner de carregamento enquanto o AuthContext verifica a sessão
  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Se não há usuário após o carregamento, redireciona para a tela de login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige uma permissão e o usuário não a possui...
  if (permissaoRequerida && !verificarPermissao(permissaoRequerida)) {
    // ...redireciona para o dashboard padrão daquele usuário, evitando o acesso indevido.
    switch (usuario.permissao) {
      case 'gerente':
        return <Navigate to="/gerente" replace />;
      // O perfil 'entregador' foi removido por enquanto, mas a lógica está aqui para o futuro
      // case 'entregador':
      //   return <Navigate to="/entregador" replace />;
      default:
        // Se por algum motivo o usuário não tiver um dashboard padrão, volta para o login
        return <Navigate to="/login" replace />;
    }
  }

  // Se todas as verificações passaram, exibe o conteúdo da rota
  return <>{children}</>;
};