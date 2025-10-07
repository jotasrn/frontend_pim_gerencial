import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShoppingBag, Truck, Users, Tag, BarChart2, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'manager':
        return [
          { name: 'Dashboard', icon: <BarChart2 size={20} />, path: '/manager' },
          { name: 'Usuários', icon: <Users size={20} />, path: '/manager/users' },
          { name: 'Produtos', icon: <ShoppingBag size={20} />, path: '/manager/products' },
          { name: 'Promoções', icon: <Tag size={20} />, path: '/manager/promotions' },
          { name: 'Clientes', icon: <User size={20} />, path: '/manager/customers' },
        ];
      case 'stockist':
        return [
          { name: 'Dashboard', icon: <BarChart2 size={20} />, path: '/stockist' },
          { name: 'Perfil', icon: <User size={20} />, path: '/stockist/profile' },
          { name: 'Adicionar Produtos', icon: <ShoppingBag size={20} />, path: '/stockist/products/add' },
        ];
      case 'deliverer':
        return [
          { name: 'Dashboard', icon: <BarChart2 size={20} />, path: '/deliverer' },
          { name: 'Pedidos Ativos', icon: <Truck size={20} />, path: '/deliverer' },
        ];
      default:
        return [
          { name: 'Dashboard', icon: <BarChart2 size={20} />, path: '/dashboard' },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b">
          <Leaf className="h-8 w-8 text-green-600" />
          <span className="ml-2 text-xl font-semibold text-gray-800">HortiFruti</span>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <ul>
            {getNavItems().map((item, index) => (
              <li key={index} className="px-2 py-1">
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout button */}
        <div className="px-2 py-1 mt-auto mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
          >
            <LogOut size={20} />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-4">
              {/* Botão de Notificações */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full">
                <Bell className="w-6 h-6" />
                {/* Badge de notificação */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              {/* Informações do usuário */}
              <span className="mr-2 font-medium">{user?.name}</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize">
                {user?.role === 'manager' ? 'Gerente' : 
                 user?.role === 'stockist' ? 'Estoquista' : 
                 user?.role === 'deliverer' ? 'Entregador' : user?.role}
              </span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;