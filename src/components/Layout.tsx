import React, { ReactNode } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Leaf, ShoppingBag, Users, Tag, BarChart2, User, LogOut, Bell, LayoutGrid, UserCircle, Truck, HelpCircle, BookOpen } from 'lucide-react';
import { useAuth, TipoUsuario } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  nome: string;
  icone: ReactNode;
  path: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    if (!usuario) return [];

    switch (usuario.permissao) {
      case 'gerente':
        return [
          { nome: 'Dashboard', icone: <BarChart2 size={20} />, path: '/gerente' },
          { nome: 'Usuários', icone: <Users size={20} />, path: '/gerente/usuarios' },
          { nome: 'Categorias', icone: <LayoutGrid size={20} />, path: '/gerente/categorias' },
          { nome: 'Produtos', icone: <ShoppingBag size={20} />, path: '/gerente/produtos' },
          { nome: 'Promoções', icone: <Tag size={20} />, path: '/gerente/promocoes' },
          { nome: 'Clientes', icone: <User size={20} />, path: '/gerente/clientes' },
          { nome: 'Fornecedores', icone: <Truck size={20} />, path: '/gerente/fornecedores' },
          { nome: 'FAQs Estáticos', icone: <BookOpen size={20} />, path: '/gerente/faq' },
          { nome: 'Dúvidas Clientes', icone: <HelpCircle size={20} />, path: '/gerente/duvidas' },
        ];
      default:
        return [
          { nome: 'Dashboard', icone: <BarChart2 size={20} />, path: '/dashboard' },
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
    return permissao;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="flex items-center justify-center h-16 border-b">
          <Leaf className="h-8 w-8 text-green-600" />
          <span className="ml-2 text-xl font-semibold text-gray-800">HortiFruti</span>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          <ul>
            {getNavItems().map((item) => (
              <li key={item.nome} className="px-2 py-1">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${isActive
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800' // Hover mais sutil
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

        <div className="px-2 py-1 mt-auto mb-4 border-t pt-2">
          <Link
            to="/perfil"
            className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md mb-1"
          >
            <UserCircle size={20} />
            <span className="ml-3">Meu Perfil</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md"
          >
            <LogOut size={20} />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
              </button>

              <div className='flex items-center'>
                <Link to="/perfil" className="mr-2 font-medium text-gray-700 hover:text-green-600">
                  {usuario?.nomeCompleto || usuario?.nomeCompleto || 'Usuário'}
                </Link>
                {usuario?.permissao && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize select-none">
                    {getRoleLabel(usuario.permissao)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;