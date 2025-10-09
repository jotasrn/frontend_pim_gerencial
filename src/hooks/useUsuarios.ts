import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/usuarioService';
import { showToast } from '../components/Toast';
import { Usuario, UsuarioData } from '../types';

interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  criarUsuario: (usuario: UsuarioData) => Promise<boolean>;
  atualizarUsuario: (id: number, usuario: Partial<UsuarioData>) => Promise<boolean>;
  removerUsuario: (id: number) => Promise<boolean>;
}

export const useUsuarios = (): UseUsuariosReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await usuarioService.listar();
      setUsuarios(dados);
    } catch (err) {
      showToast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarUsuario = async (usuario: UsuarioData): Promise<boolean> => {
    try {
      await usuarioService.criar(usuario);
      await carregarUsuarios();
      showToast.success('Usuário criado com sucesso!');
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  const atualizarUsuario = async (id: number, usuario: Partial<UsuarioData>): Promise<boolean> => {
    try {
      await usuarioService.atualizar(id, usuario);
      await carregarUsuarios();
      showToast.success('Usuário atualizado com sucesso!');
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  const removerUsuario = async (id: number): Promise<boolean> => {
    try {
      await usuarioService.remover(id);
      await carregarUsuarios();
      showToast.success('Usuário removido com sucesso!');
      return true;
    } catch (err) {
      showToast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  return {
    usuarios,
    loading,
    criarUsuario,
    atualizarUsuario,
    removerUsuario,
  };
};