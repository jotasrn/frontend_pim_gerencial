import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'manager':
          navigate('/manager');
          break;
        case 'stockist':
          navigate('/stockist');
          break;
        case 'deliverer':
          navigate('/deliverer');
          break;
        default:
          // If role is not recognized, stay on dashboard
          break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
};

export default Dashboard;