import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ApiErrorBoundary from './components/ApiErrorBoundary';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import UserManagement from './pages/manager/UserManagement';
import ProductManagement from './pages/manager/ProductManagement';
import PromotionManagement from './pages/manager/PromotionManagement';
import CustomerList from './pages/manager/CustomerList';
import CategoryManagement from './pages/manager/CategoryManagement';
import UserProfile from './pages/UserProfile';
import FornecedorManagement from './pages/manager/FornecedorManagement';
// import StockManagement from './pages/manager/StockManagement';       // Descomentar quando criar
// import OrderManagement from './pages/manager/OrderManagement';         // Descomentar quando criar
// import DeliveryManagement from './pages/manager/DeliveryManagement';   // Descomentar quando criar
// import SupplierManagement from './pages/manager/SupplierManagement';   // Descomentar quando criar

// Pages - Entregador (Protegidas) - Se aplicável no futuro
// import DelivererDashboard from './pages/deliverer/DelivererDashboard';

function App() {
  return (
    <ApiErrorBoundary>
      {/* 2. Provedor de Autenticação envolve tudo para gerenciar o estado do usuário */}
      <AuthProvider>
        {/* 3. Configuração do Roteador */}
        <Router>
          {/* 4. Container para exibir toasts/notificações */}
          <ToastContainer />
          {/* 5. Container principal da aplicação */}
          <div className="min-h-screen bg-gray-100"> {/* Mudado bg-gray-50 para bg-gray-100 para combinar com Layout */}
            {/* 6. Definição das Rotas */}
            <Routes>
              {/* Rota Pública */}
              <Route path="/login" element={<Login />} />

              {/* Rota Raiz: Redireciona para o Dashboard principal */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rota de Dashboard Principal (Protegida, redireciona para o específico) */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />

              {/* === ROTAS DO GERENTE === */}
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

              <Route
                path="/gerente/categorias"
                element={<ProtectedRoute permissaoRequerida="gerente"><CategoryManagement /></ProtectedRoute>}
              />
              <Route
                path="/perfil"
                element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
              />
              <Route
                path="/gerente/fornecedores"
                element={<ProtectedRoute permissaoRequerida="gerente"><FornecedorManagement /></ProtectedRoute>}
              />
              {/* Adicionar Rotas para as Novas Páginas do Gerente Aqui: */}
              {/*
              
              <Route
                path="/gerente/estoque"
                element={<ProtectedRoute permissaoRequerida="gerente"><StockManagement /></ProtectedRoute>}
              />
              <Route
                path="/gerente/pedidos"
                element={<ProtectedRoute permissaoRequerida="gerente"><OrderManagement /></ProtectedRoute>}
              />
               <Route
                path="/gerente/entregas"
                element={<ProtectedRoute permissaoRequerida="gerente"><DeliveryManagement /></ProtectedRoute>}
              />
               <Route
                path="/gerente/fornecedores"
                element={<ProtectedRoute permissaoRequerida="gerente"><SupplierManagement /></ProtectedRoute>}
              />
              */}

              {/* === ROTAS DO ENTREGADOR === (Exemplo para o futuro) */}
              {/*
              <Route
                path="/entregador"
                element={<ProtectedRoute permissaoRequerida="entregador"><DelivererDashboard /></ProtectedRoute>}
              />
              */}


              {/* Rota Catch-all: Se nenhuma rota corresponder, redireciona para o Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ApiErrorBoundary>
  );
}

export default App;