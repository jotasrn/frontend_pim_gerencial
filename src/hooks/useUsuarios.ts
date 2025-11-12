import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/usuarioService';
import { entregadorService } from '../services/entregadorService';
import { showToast } from '../components/Toast';
import { Usuario, UsuarioData } from '../types';

type UsuarioDataCompleta = UsuarioData & {
  tipoVeiculo?: string;
  placaVeiculo?: string;
};

interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  carregarUsuarios: () => void;
  criarUsuario: (usuario: UsuarioDataCompleta) => Promise<boolean>;
  atualizarUsuario: (id: number, usuario: Partial<UsuarioDataCompleta>) => Promise<boolean>;
  removerUsuario: (id: number) => Promise<boolean>;
}

export const useUsuarios = (): UseUsuariosReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await usuarioService.listar();
      setUsuarios(dados);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao carregar usuários: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarUsuario = async (usuario: UsuarioDataCompleta): Promise<boolean> => {
    setError(null);
    try {
      if (usuario.permissao === 'entregador') {
        await entregadorService.criarEntregador(usuario);
      } else {
        await usuarioService.criar(usuario);
      }
      showToast.success('Usuário criado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao criar usuário: ${errorMessage}`);
      return false;
    }
  };

  const atualizarUsuario = async (id: number, usuario: Partial<UsuarioDataCompleta>): Promise<boolean> => {
    setError(null);
    try {
      if (usuario.permissao === 'entregador') {
        await entregadorService.atualizarEntregador(id, usuario);
      } else {
        await usuarioService.atualizar(id, usuario);
      }
      showToast.success('Usuário atualizado com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao atualizar usuário: ${errorMessage}`);
      return false;
    }
  };

  const removerUsuario = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await usuarioService.remover(id);
      showToast.success('Usuário removido com sucesso!');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
      showToast.error(`Erro ao remover usuário: ${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  return {
    usuarios,
    loading,
    error,
    carregarUsuarios,
    criarUsuario,
    atualizarUsuario,
    removerUsuario,
  };
};