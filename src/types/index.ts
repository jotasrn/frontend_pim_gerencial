// src/types.ts

// --- Tipos de Autenticação e Usuário ---

export type TipoUsuario = 'gerente' | 'entregador' | 'cliente';

export interface Usuario {
  id: number;
  nomeCompleto: string; // O backend usa nomeCompleto, vamos padronizar
  email: string;
  permissao: TipoUsuario;
  ativo?: boolean;
  googleId?: string; // Incluído para login Google
  is2faEnabled?: boolean; // Incluído para 2FA
}

export type UsuarioData = {
  nomeCompleto: string;
  email: string;
  senha?: string; // Senha é opcional na atualização
  permissao: TipoUsuario;
  ativo: boolean;
};

// --- Tipos de Cliente ---

export interface Cliente {
  id: number; // O ID do cliente é o mesmo do usuário
  usuario?: Usuario; // Dados do usuário associado
  cpf?: string;
  telefone?: string;
  enderecos?: Endereco[]; // Lista de endereços
  // Removido: nome, email (vem do usuario)
  // Removido: totalPedidos, ultimoPedido (não vêm da API /clientes)
}

// --- Tipos de Endereço ---

export interface Endereco {
  id: number;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  cliente?: Cliente; // Referência ao cliente (pode ser omitida em DTOs)
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
  dataValidade?: string; // Formato YYYY-MM-DD
  dataColheita?: string; // Formato YYYY-MM-DD
  tipoMedida?: string; // Ex: 'KG', 'UN', 'BDJ'
  codigoBarras?: string;
  imagemUrl?: string; // URL da imagem do produto
  ativo: boolean;
  categoria?: Categoria;
  promocoes?: Promocao[]; // Promoções associadas
}

export type ProdutoData = Omit<Produto, 'id' | 'precoVenda' | 'categoria' | 'promocoes' | 'imagemUrl'> & {
  categoria: {
    id: number;
  };
  // A imagem será tratada separadamente como File no service/hook
};

export interface FiltrosProdutos {
  nome?: string;
  categoriaId?: number; // Usar string se o select retornar string
  ativo?: boolean;
}

// --- Tipos de Estoque ---

export interface Estoque {
  id: number;
  produto?: Produto; // Geralmente o ID é suficiente
  produtoId: number;
  quantidadeAtual: number;
  quantidadeMinima?: number;
}

// --- Tipos de Venda e ItemVenda ---

export interface ItemVenda {
  id: number;
  produto?: Produto; // Detalhes do produto
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface Venda {
  id: number;
  cliente?: Cliente; // Detalhes do cliente
  clienteId: number;
  dataHora: string; // Formato ISO (Instant)
  valorTotal: number;
  formaPagamento: string;
  statusPedido: string; // Ex: 'PAGAMENTO_APROVADO', 'EM_PREPARACAO', 'CONCLUIDO'
  enderecoEntrega?: Endereco; // Endereço de entrega selecionado
  enderecoEntregaId?: number;
  itens: ItemVenda[];
}

// --- Tipos de Entrega ---

export interface Entrega {
  id: number;
  venda?: Venda; // Detalhes da venda associada
  vendaId: number;
  entregador?: Usuario; // Detalhes do entregador
  entregadorId?: number;
  status: string; // Ex: 'PENDENTE', 'EM_ROTA', 'ENTREGUE'
  dataEntrega?: string; // Formato YYYY-MM-DD
}

export interface FiltrosEntregas {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  entregadorId?: number;
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
  produto?: Produto; // Detalhes do produto
  produtoId: number;
  quantidade: number;
  motivo?: string;
  dataPerda: string; // Formato YYYY-MM-DD
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
  dataInicio: string; // Formato YYYY-MM-DD
  dataFim: string; // Formato YYYY-MM-DD
  ativa: boolean;
  produtos?: Produto[]; // Produtos associados (pode vir vazio dependendo do endpoint)
}

export type PromocaoData = {
  descricao: string;
  percentualDesconto: number;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  produtoIds: number[]; // Apenas IDs dos produtos ao criar/atualizar
};

export interface FiltrosPromocoes {
  ativa?: boolean;
  data?: string; // Para verificar promoções ativas em uma data específica
}

// --- Tipos de Relatório ---

export interface FiltrosRelatorios {
  dataInicio?: string;
  dataFim?: string;
  limite?: number; // Adicionado para limitar resultados
}

export interface VendasCategoriaData {
  categoria: string;
  totalVendido: number;
}

export interface TopProdutosData {
  nomeProduto: string;
  totalVendido: number; // No backend é Long
}

export interface PerdasMotivoData {
  motivo: string;
  totalPerdido: number; // No backend é Long
}

export interface NiveisEstoqueData {
  nomeProduto: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
}

export interface EstoqueCriticoData {
  totalItens: number; // No backend é Long
  itensCriticos: number; // No backend é Long
}