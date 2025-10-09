// --- Tipos de Autenticação e Usuário ---

export type TipoUsuario = 'gerente' | 'entregador' | 'cliente';

export interface Usuario {
  id: number;
  nome: string; // O front-end usará 'nome'
  nomeCompleto?: string; // O back-end envia 'nomeCompleto'
  email: string;
  permissao: TipoUsuario;
  ativo?: boolean;
}

// Dados para criar/atualizar um usuário do painel administrativo
export type UsuarioData = {
  nomeCompleto: string;
  email: string;
  senha?: string;
  permissao: TipoUsuario;
  ativo: boolean;
};

// --- Tipos de Cliente ---

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    totalPedidos: number;
    ultimoPedido: string;
}


// --- Tipos de Produto e Categoria ---

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  precoCusto: number;
  precoVenda: number;
  dataValidade?: string;
  tipoMedida?: string;
  codigoBarras?: string;
  ativo: boolean;
  categoria?: Categoria;
}

// Dados para criar/atualizar um produto
export type ProdutoData = Omit<Produto, 'id' | 'precoVenda' | 'categoria'> & {
  categoria: {
    id: number;
  };
};

export interface FiltrosProdutos {
  nome?: string;
  categoriaId?: number;
}


// --- Tipos de Estoque ---

export interface Estoque {
  id: number;
  produto: Produto;
  quantidade: number;
  quantidadeMinima: number;
}


// --- Tipos de Venda e Entrega ---

export interface Venda {
  id: number;
  dataHora: string;
  valorTotal: number;
  status: string;
  // Adicione outros campos da Venda se necessário
}

export interface Entrega {
  id: number;
  venda: Venda;
  entregador?: Usuario;
  status: string;
  dataEntrega?: string;
}

export interface FiltrosEntregas {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}


// --- Tipos de Fornecedor ---

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
}

export interface FiltrosFornecedores {
  nome?: string;
}


// --- Tipos de Perda ---

export interface Perda {
  id: number;
  produto: Produto;
  quantidade: number;
  motivo?: string;
  dataPerda: string;
}

export type PerdaData = {
  produtoId: number;
  quantidade: number;
  motivo?: string;
};

export interface FiltrosPerdas {
  dataInicio?: string;
  dataFim?: string;
  produtoId?: number;
}


// --- Tipos de Promoção ---

export interface Promocao {
  id: number;
  descricao: string;
  percentualDesconto: number;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  produtos: Produto[];
}

export type PromocaoData = {
  descricao: string;
  percentualDesconto: number;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  produtoIds: number[];
};

export interface FiltrosPromocoes {
  ativa?: boolean;
  data?: string;
}


// --- Tipos de Relatório ---

export interface FiltrosRelatorios {
  dataInicio?: string;
  dataFim?: string;
}