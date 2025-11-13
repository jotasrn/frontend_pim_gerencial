import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
// 1. IMPORTAR PieChart
import { Leaf, Users, Tag, BarChart2, User, LogOut, Bell, LayoutGrid, Clock, UserCircle, Truck, HelpCircle, BookOpen, Package, Menu, X, Archive, ShoppingCart, PieChart } from 'lucide-react';
import { useAuth, TipoUsuario } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificacaoContext';
import NotificationModal from './modals/NotificacaoModal';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  nome: string;
  icone: ReactNode;
  path: string;
  end?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { usuario, logout } = useAuth();
  const { totalNotifications } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    if (!usuario) return [];

    switch (usuario.permissao) {
      case 'gerente':
        return [
          { nome: 'Dashboard', icone: <BarChart2 size={20} />, path: '/gerente', end: true },
          { nome: 'Vendas', icone: <ShoppingCart size={20} />, path: '/gerente/vendas' },
          { nome: 'Relatórios', icone: <PieChart size={20} />, path: '/gerente/relatorios' }, // 2. ADICIONAR ITEM
          { nome: 'Usuários', icone: <Users size={20} />, path: '/gerente/usuarios' },
          { nome: 'Promoções', icone: <Tag size={20} />, path: '/gerente/promocoes' },
          { nome: 'Clientes', icone: <User size={20} />, path: '/gerente/clientes' },
          { nome: 'FAQs Estáticos', icone: <BookOpen size={20} />, path: '/gerente/faq' },
          { nome: 'Dúvidas Clientes', icone: <HelpCircle size={20} />, path: '/gerente/duvidas' },
        ];
      case 'estoquista':
        return [
          { nome: 'Dashboard', icone: <BarChart2 size={20} />, path: '/estoquista', end: true },
          { nome: 'Produtos', icone: <Package size={20} />, path: '/estoquista/produtos' },
          { nome: 'Categorias', icone: <LayoutGrid size={20} />, path: '/estoquista/categorias' },
          { nome: 'Fornecedores', icone: <Truck size={20} />, path: '/estoquista/fornecedores' },
          { nome: 'Perdas', icone: <Archive size={20} />, path: '/estoquista/perdas' },
        ];
      case 'entregador':
        return [
          { nome: 'Minhas Entregas', icone: <Truck size={20} />, path: '/entregador', end: true },
          { nome: 'Histórico', icone: <Clock size={20} />, path: '/entregador/historico' },
        ];
      default:
        return [
          { nome: 'Dashboard', icone: <BarChart2 size={20} />, path: '/dashboard', end: true },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (permissao: TipoUsuario) => {
    if (permissao === 'gerente') return 'Gerente';
    if (permissao === 'entregador') return 'Entregador';
    if (permissao === 'estoquista') return 'Estoquista';
    return permissao;
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">

        {isMobileMenuOpen && (
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 
     ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between h-16 border-b dark:border-gray-700 px-4">
            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-100">HortiFruti</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 mt-6 overflow-y-auto">
            <ul>
              {getNavItems().map((item) => (
                <li key={item.nome} className="px-2 py-1">
                  <NavLink
                    to={item.path}
                    end={item.end ?? false}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                      }`
                    }
                  >
                    {item.icone}
                    <span className="ml-3">{item.nome}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-2 py-1 mt-auto mb-4 border-t dark:border-gray-700 pt-2">
            <Link
              to="/perfil"
              onClick={closeMobileMenu}
              className="w-full flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 rounded-md mb-1"
            >
              <UserCircle size={20} />
              <span className="ml-3">Meu Perfil</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 rounded-md"
            >
              <LogOut size={20} />
              <span className="ml-3">Sair</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <header className="bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 lg:ml-0 ml-3">
                  {title}
                </h1>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full"
                >
                  <Bell className="w-6 h-6" />
                  {totalNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {totalNotifications}
                    </span>
                  )}
                </button>

                <div className='flex items-center'>
                  <Link to="/perfil" className="hidden sm:block mr-2 font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400">
                    {usuario?.nomeCompleto || 'Usuário'}
                  </Link>
                  {usuario?.permissao && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full capitalize select-none">
                      {getRoleLabel(usuario.permissao)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Layout;