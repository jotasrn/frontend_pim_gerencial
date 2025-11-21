// src/types.ts

export type TipoUsuario = 'gerente' | 'entregador' | 'cliente';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  email: string;
  permissao: TipoUsuario;
  ativo?: boolean;
  googleId?: string;
  tipoVeiculo?: string;
  placaVeiculo?: string;
}

export type UsuarioData = {
  nomeCompleto: string;
  email: string;
  senha?: string;
  permissao: TipoUsuario;
  ativo: boolean;
};

export interface Cliente {
  id: number;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
}

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
  cliente?: Cliente;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export type CategoriaData = Omit<Categoria, 'id'>;
export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  precoCusto: number;
  precoVenda: number;
  dataValidade?: string;
  dataColheita?: string;
  tipoMedida?: string;
  codigoBarras?: string;
  imagemUrl?: string;
  ativo: boolean;
  categoria?: Categoria;
  promocoes?: Promocao[];
  estoque?: {
    id: number;
    quantidadeAtual: number;
    quantidadeMinima?: number;
  };
  fornecedores?: Fornecedor[];
}


export type ProdutoData = Omit<Produto, 'id' | 'precoVenda' | 'categoria' | 'promocoes' | 'imagemUrl'> & {
  categoria: {
    id: number;
  };
  quantidadeMinima?: number;
  quantidadeAtual?: number;
  fornecedorIds?: number[];
};

export interface FiltrosProdutos {
  nome?: string;
  categoriaId?: number | string;
  ativo?: boolean;
  status?: string;
}

export interface Estoque {
  id: number;
  produto?: Produto;
  produtoId: number;
  quantidadeAtual: number;
  quantidadeMinima?: number;
}

export interface ItemVenda {
  id: number;
  produto?: Produto;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface Venda {
  id: number;
  cliente?: Cliente;
  clienteId: number;
  dataHora: string;
  valorTotal: number;
  formaPagamento: string;
  statusPedido: string;
  enderecoEntrega?: Endereco;
  enderecoEntregaId?: number;
  itens: ItemVenda[];
}

export interface Entrega {
  id: number;
  venda?: Venda;
  vendaId: number;
  entregador?: Usuario;
  entregadorId?: number;
  status: string;
  dataEntrega?: string;
  dataConclusao?: string;
}

export interface FiltrosEntregas {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  entregadorId?: number;
}

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
}

export interface FiltrosFornecedores {
  nome?: string;
}

export interface Perda {
  id: number;
  produto?: Produto;
  produtoId: number;
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

export interface Promocao {
  id: number;
  descricao: string;
  percentualDesconto: number;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  imagemUrl?: string;
  produtos?: Produto[];
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
  status?: 'all';
}

export interface FiltrosRelatorios {
  dataInicio?: string;
  dataFim?: string;
  limite?: number;
}

export interface VendasCategoriaData {
  categoria: string;
  totalVendido: number;
}

export interface TopProdutosData {
  nomeProduto: string;
  totalVendido: number;
}

export interface PerdasMotivoData {
  motivo: string;
  totalPerdido: number;
}

export interface NiveisEstoqueData {
  nomeProduto: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
}

export interface EstoqueCriticoData {
  totalItens: number;
  itensCriticos: number;
}

export interface Faq {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FaqData = Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>;

export interface Duvida {
  id: number;
  usuario?: Usuario;
  titulo: string;
  pergunta: string;
  publico: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  resposta?: string;
  dataResposta?: string;
  respondente?: Usuario;
}

export interface DuvidaResposta {
  id: number;
  respondente?: Usuario;
  resposta: string;
  visivelParaTodos: boolean;
  createdAt: string;
}

export interface DuvidaRequest {
  email: string;
  titulo: string;
  pergunta: string;
}

export interface DuvidaRespostaRequest {
  resposta: string;
}

export interface EntregaStatusUpdate {
  status: string;
  nomeRecebedor?: string;
  documentoRecebedor?: string;
}

export interface NotificationDTO {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string;
}