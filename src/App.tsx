import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext.tsx';
import ApiErrorBoundary from './components/ApiErrorBoundary.tsx';
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
import StockistDashboard from './pages/stockist/StockistDashboard';
import StockistProfile from './pages/stockist/StockistProfile';
import ProductAdd from './pages/stockist/ProductAdd';
import DelivererDashboard from './pages/deliverer/DelivererDashboard';
import OrderDetails from './pages/deliverer/OrderDetails';

function App() {
  return (
    <ApiErrorBoundary>
      <ApiProvider>
        <AuthProvider>
          <Router>
            <ToastContainer />
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard - redirects based on role */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Manager routes */}
                <Route 
                  path="/manager" 
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manager/users" 
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manager/products" 
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ProductManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manager/promotions" 
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <PromotionManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manager/customers" 
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <CustomerList />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Stockist routes */}
                <Route 
                  path="/stockist" 
                  element={
                    <ProtectedRoute requiredRole="stockist">
                      <StockistDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/stockist/profile" 
                  element={
                    <ProtectedRoute requiredRole="stockist">
                      <StockistProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/stockist/products/add" 
                  element={
                    <ProtectedRoute requiredRole="stockist">
                      <ProductAdd />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Deliverer routes */}
                <Route 
                  path="/deliverer" 
                  element={
                    <ProtectedRoute requiredRole="deliverer">
                      <DelivererDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/deliverer/orders/:id" 
                  element={
                    <ProtectedRoute requiredRole="deliverer">
                      <OrderDetails />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ApiProvider>
    </ApiErrorBoundary>
  );
}

export default App;