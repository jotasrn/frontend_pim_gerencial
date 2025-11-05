import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      switch (usuario.permissao) {
        case 'gerente':
          navigate('/gerente', { replace: true });
          break;
        case 'entregador':
          navigate('/entregador', { replace: true });
          break;
        case 'estoquista':
          navigate('/estoquista', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
          break;
      }
    }
  }, [usuario, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner text="Redirecionando..." />
    </div>
  );
};

export default Dashboard;