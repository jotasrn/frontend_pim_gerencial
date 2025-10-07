import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, checkRole } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && !checkRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'manager':
        return <Navigate to="/manager" replace />;
      case 'stockist':
        return <Navigate to="/stockist" replace />;
      case 'deliverer':
        return <Navigate to="/deliverer" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};