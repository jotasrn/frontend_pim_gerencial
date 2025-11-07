import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificacaoContext';
import { ThemeProvider } from './contexts/TemaContext';
import ApiErrorBoundary from './components/ApiErrorBoundary';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ManagerDashboard from './pages/gerente/GerenteDashboard';
import UserManagement from './pages/gerente/UsuariosManagement';
import ProductManagement from './pages/estoquista/ProdutoManagement';
import PromotionManagement from './pages/gerente/PromocaoManagement';
import CustomerList from './pages/gerente/CustomerList';
import CategoryManagement from './pages/estoquista/CategoriaManagement';
import UserProfile from './pages/Perfil';
import FornecedorManagement from './pages/estoquista/FornecedorManagement';
import FaqManagement from './pages/gerente/FaqManagement';
import DuvidasManagement from './pages/gerente/DuvidasManagement';
import DelivererDashboard from './pages/Entregador/EntregadorDashboard';
import OrderDetails from './pages/Entregador/OrderDetails';
import DeliveryHistory from './pages/Entregador/EntregadorHistorico';
import EstoquistaDashboard from './pages/estoquista/EstoquistaDashboard';

function App() {
  return (
    <ApiErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <ToastContainer />
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/perfil"
                    element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
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
                    path="/gerente/promocoes"
                    element={<ProtectedRoute permissaoRequerida="gerente"><PromotionManagement /></ProtectedRoute>}
                  />
                  <Route
                    path="/gerente/clientes"
                    element={<ProtectedRoute permissaoRequerida="gerente"><CustomerList /></ProtectedRoute>}
                  />
                  <Route
                    path="/gerente/faq"
                    element={<ProtectedRoute permissaoRequerida="gerente"><FaqManagement /></ProtectedRoute>}
                  />
                  <Route
                    path="/gerente/duvidas"
                    element={<ProtectedRoute permissaoRequerida="gerente"><DuvidasManagement /></ProtectedRoute>}
                  />

                  <Route
                    path="/estoquista"
                    element={<ProtectedRoute permissaoRequerida="estoquista"><EstoquistaDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/estoquista/produtos"
                    element={<ProtectedRoute permissaoRequerida="estoquista"><ProductManagement /></ProtectedRoute>}
                  />
                  <Route
                    path="/estoquista/categorias"
                    element={<ProtectedRoute permissaoRequerida="estoquista"><CategoryManagement /></ProtectedRoute>}
                  />
                  <Route
                    path="/estoquista/fornecedores"
                    element={<ProtectedRoute permissaoRequerida="estoquista"><FornecedorManagement /></ProtectedRoute>}
                  />

                  <Route
                    path="/entregador"
                    element={<ProtectedRoute permissaoRequerida="entregador"><DelivererDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/entregador/entrega/:id"
                    element={<ProtectedRoute permissaoRequerida="entregador"><OrderDetails /></ProtectedRoute>}
                  />
                  <Route
                    path="/entregador/historico"
                    element={<ProtectedRoute permissaoRequerida="entregador"><DeliveryHistory /></ProtectedRoute>}
                  />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApiErrorBoundary>
  );
}

export default App;