import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

export type TipoUsuario = 'gerente' | 'entregador';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  permissao: TipoUsuario;
}

interface TipoAuthContext {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  verificarPermissao: (permissao: TipoUsuario) => boolean;
}

const AuthContext = createContext<TipoAuthContext>({} as TipoAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true); // Inicia como true para verificar a sessão

  // Verifica se o usuário já tem uma sessão ativa ao carregar o app
  useEffect(() => {
    const verificarStatusAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        // Se temos um token, validamos ele no back-end e buscamos os dados do usuário
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const resposta = await api.get('/usuarios/me');
          
          const dadosUsuario: Usuario = {
            id: resposta.data.id,
            nomeCompleto: resposta.data.nomeCompleto, 
            email: resposta.data.email,
            permissao: resposta.data.permissao.toLowerCase() as TipoUsuario, 
          };
          setUsuario(dadosUsuario);
        } catch (error) {
          // Se o token for inválido, limpa tudo
          console.error('Sessão inválida, limpando token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setCarregando(false);
    };

    verificarStatusAuth();
  }, []);

  // Função de Login conectada à API
  const login = async (email: string, senha: string) => {
    try {
      setCarregando(true);
      
      // 1. Chama o endpoint de login
      const respostaLogin = await api.post('/auth/login', { email, senha });
      const { token } = respostaLogin.data;

      if (!token) {
        throw new Error('Token não recebido da API');
      }

      // 2. Salva o token e configura no Axios para futuras requisições
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Busca os dados do usuário com o novo token
      const respostaUsuario = await api.get('/usuarios/me');
      const dadosUsuario: Usuario = {
        id: respostaUsuario.data.id,
        nomeCompleto: respostaUsuario.data.nomeCompleto,
        email: respostaUsuario.data.email,
        permissao: respostaUsuario.data.permissao.toLowerCase() as TipoUsuario,
      };

      setUsuario(dadosUsuario);
      localStorage.setItem('user', JSON.stringify(dadosUsuario));

    } catch (error) {
      console.error('Falha no login:', error);
      // Garante que tudo seja limpo em caso de erro
      logout();
      throw error;
    } finally {
      setCarregando(false);
    }
  };

  // Função de Logout
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  // Verifica a permissão do usuário logado
  const verificarPermissao = (permissaoRequerida: TipoUsuario): boolean => {
    return usuario?.permissao === permissaoRequerida;
  };

  // Valor que será disponibilizado para toda a aplicação
  const valor = {
    usuario,
    carregando,
    login,
    logout,
    verificarPermissao,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};