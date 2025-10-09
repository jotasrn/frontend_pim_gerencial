import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ApiErrorBoundary from './components/ApiErrorBoundary';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import UserManagement from './pages/manager/UserManagement';
import ProductManagement from './pages/manager/ProductManagement';
import PromotionManagement from './pages/manager/PromotionManagement';
import CustomerList from './pages/manager/CustomerList';

function App() {
  return (
    <ApiErrorBoundary>
      {/* 1. AuthProvider envolve toda a aplicação */}
      <AuthProvider>
        <Router>
          <ToastContainer />
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* 2. A rota de Login está aqui dentro, então receberá o contexto */}
              <Route path="/login" element={<Login />} />
              
              {/* O resto das suas rotas */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/gerente" 
                element={<ProtectedRoute permissaoRequerida="gerente"><ManagerDashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/gerente/usuarios" 
                element={<ProtectedRoute permissaoRequerida="gerente"><UserManagement /></ProtectedRoute>} 
              />
              <Route 
                path="/gerente/produtos" 
                element={<ProtectedRoute permissaoRequerida="gerente"><ProductManagement /></ProtectedRoute>} 
              />
              <Route 
                path="/gerente/promocoes" 
                element={<ProtectedRoute permissaoRequerida="gerente"><PromotionManagement /></ProtectedRoute>} 
              />
              <Route 
                path="/gerente/clientes" 
                element={<ProtectedRoute permissaoRequerida="gerente"><CustomerList /></ProtectedRoute>} 
              />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ApiErrorBoundary>
  );
}

export default App;