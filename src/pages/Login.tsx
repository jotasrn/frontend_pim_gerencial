import React, { useState, useEffect } from 'react';
// Removido useNavigate, pois o redirecionamento é automático
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatApiError } from '../utils/apiHelpers';
import { Navigate } from 'react-router-dom'; // Import Navigate para redirecionamento

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, usuario, carregando } = useAuth(); // Pega usuario e carregando para redirecionar se já logado

  // Redireciona se o usuário já estiver logado (após a verificação inicial)
  useEffect(() => {
    // Não redireciona enquanto o AuthContext ainda está verificando a sessão
    if (!carregando && usuario) {
      // Navega para o dashboard apropriado baseado na permissão
      switch (usuario.permissao) {
        case 'gerente':
          // Usamos <Navigate> fora do useEffect não é o ideal,
          // mas vamos colocar a lógica de redirecionamento aqui para simplificar
          // O ideal seria que App.tsx gerenciasse isso
          window.location.replace('/gerente'); // Força um refresh para garantir limpeza
          break;
        // Adicionar outros casos (ex: entregador) se necessário
        default:
          window.location.replace('/dashboard'); // Rota genérica
          break;
      }
    }
  }, [usuario, carregando]); // Executa quando usuario ou carregando mudam


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // **NÃO PRECISA MAIS DE navigate('/dashboard') AQUI**
      // O AuthContext atualizará o estado 'usuario', e o useEffect acima
      // ou a lógica em App.tsx cuidará do redirecionamento.
    } catch (err) {
      const errorMessage = formatApiError(err);
      setError(errorMessage);
    } finally {
      // Garante que o loading seja desativado antes de qualquer redirecionamento
      setIsLoading(false);
    }
  };

  // Se ainda estiver carregando a verificação inicial, mostra um loader
  if (carregando) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        </div>
      );
  }

  // Se já estiver logado após o carregamento, Navigate redireciona (essa parte pode ser redundante se o useEffect funcionar bem)
  if (usuario) {
      return <Navigate to="/dashboard" replace />;
  }


  // Renderiza o formulário de login se não estiver logado e não estiver carregando
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-lime-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <Leaf className="h-12 w-auto text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login - HortiFruti
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gerenciamento
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Exibição de Erro Aprimorada */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Erro de Login</p>
              <p>{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading} // Desabilita input durante loading
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading} // Desabilita input durante loading
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                placeholder="Senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {/* Ícone de Loading Condicional */}
              {isLoading && (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {/* Spinner SVG mais moderno */}
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;