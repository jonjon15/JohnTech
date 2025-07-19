/**
 * Tipos baseados na documentação oficial do Bling
 * https://developer.bling.com.br/referencia
 */

// Produto
export interface BlingProduct {
  id: number
  nome: string
  codigo: string
  preco: number
  tipo?: "P" | "S" // P=Produto, S=Serviço
  situacao?: "A" | "I" // A=Ativo, I=Inativo
  formato?: "S" | "V" | "U" // S=Simples, V=Variação, U=Unidade
  descricaoCurta?: string
  descricaoComplementar?: string
  unidade?: string
  pesoLiquido?: number
  pesoBruto?: number
  volumes?: number
  itensPorCaixa?: number
  gtin?: string
  gtinEmbalagem?: string
  tipoProducao?: "P" | "T" // P=Própria, T=Terceiros
  condicao?: 0 | 1 | 2 | 3 | 4 | 5 // 0=Não especificado, 1=Novo, etc.
  freteGratis?: boolean
  marca?: string
  descricaoFornecedor?: string
  categoria?: {
    id: number
  }
  estoque?: {
    minimo?: number
    maximo?: number
    crossdocking?: number
    localizacao?: string
  }
  tributacao?: {
    origem?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    nfci?: string
    ncm?: string
    cest?: string
    codigoListaServicos?: string
    spedTipoItem?: string
    codigoItem?: string
    percentualTributos?: number
    valorBaseStRetencao?: number
    valorStRetencao?: number
    valorICMSSubstituto?: number
    codigoBeneficioFiscal?: string
  }
  variacao?: {
    nome: string
    ordem: number
    produtoPai: {
      id: number
    }
    variacao: {
      nome: string
      valor: string
    }[]
  }
  imagens?: {
    linkExterno: string
  }[]
}

// Categoria
export interface BlingCategory {
  id: number
  descricao: string
  categoriaPai?: {
    id: number
  }
}

// Estoque
export interface BlingStock {
  id: number
  produtoId: number
  depositoId: number
  quantidade: number
  saldoVirtualTotal?: number
  saldoFisicoTotal?: number
  saldoVirtualDisponivel?: number
}

export interface StockUpdate {
  produto: {
    id: number
  }
  deposito: {
    id: number
  }
  operacao: "B" | "S" | "T" // B=Balanço, S=Saída, T=Transferência
  preco: number
  custo: number
  quantidade: number
  observacoes?: string
}

// Pedido
export interface BlingOrder {
  id: number
  numero: string
  numeroLoja?: string
  data: string
  dataSaida?: string
  dataPrevista?: string
  totalVenda: number
  observacoes?: string
  observacoesInternas?: string
  desconto?: {
    valor: number
    unidade: "%" | "R"
  }
  categoria?: {
    id: number
  }
  contato: {
    id?: number
    nome: string
    tipoPessoa?: "F" | "J" // F=Física, J=Jurídica
    contribuinte?: 0 | 1 | 2 | 9
    endereco?: BlingAddress
    telefone?: string
    celular?: string
    email?: string
  }
  itens: BlingOrderItem[]
  parcelas?: BlingInstallment[]
  transporte?: {
    transportadora?: {
      id: number
    }
    fretePorConta?: 0 | 1 | 2 // 0=Contratação do frete por conta do remetente (CIF), 1=Contratação do frete por conta do destinatário (FOB), 2=Contratação do frete por conta de terceiros
    frete?: number
    quantidadeVolumes?: number
    pesoBruto?: number
    prazoEntrega?: number
    contato?: {
      tipoPessoa?: "F" | "J"
      numeroDocumento?: string
      nome: string
      telefone?: string
      celular?: string
      email?: string
      endereco?: BlingAddress
    }
    endereco?: BlingAddress
  }
}

export interface BlingOrderItem {
  produto: {
    id: number
  }
  quantidade: number
  valor: number
  aliquotaIPI?: number
  desconto?: {
    valor: number
    unidade: "%" | "R"
  }
  comissao?: {
    base?: number
    aliquota?: number
    valor?: number
  }
}

export interface BlingInstallment {
  dataVencimento: string
  valor: number
  observacoes?: string
  formaPagamento?: {
    id: number
  }
}

// Endereço
export interface BlingAddress {
  endereco: string
  numero?: string
  complemento?: string
  bairro: string
  cep: string
  municipio: string
  uf: string
  pais?: string
}

// Contato
export interface BlingContact {
  id?: number
  nome: string
  codigo?: string
  situacao?: "A" | "I"
  numeroDocumento?: string
  telefone?: string
  celular?: string
  email?: string
  endereco?: BlingAddress
  informacoesAdicionais?: {
    pessoaFisica?: {
      sexo?: "M" | "F"
      dataNascimento?: string
    }
    pessoaJuridica?: {
      inscricaoEstadual?: string
      inscricaoMunicipal?: string
      nomeFantasia?: string
    }
  }
  tipos?: Array<"C" | "F" | "T" | "V"> // C=Cliente, F=Fornecedor, T=Transportadora, V=Vendedor
}

// Requests
export interface CreateProductRequest extends Omit<BlingProduct, "id"> {}
export interface UpdateProductRequest extends Partial<Omit<BlingProduct, "id">> {}
export interface CreateOrderRequest extends Omit<BlingOrder, "id" | "numero"> {}

// Token Data
export interface BlingTokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  scope: string
  expiresAt: string // Adicionado para armazenar a data de expiração calculada
}

export interface StoredToken {
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: Date
  created_at: Date
  updated_at: Date
}

// API Error
export interface BlingApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

// API Response
export interface BlingApiResponse<T> {
  success: boolean
  data: T | null
  error: BlingApiError | null
}

// Webhooks Bling
export interface BlingWebhookEvent {
  evento: {
    tipo: string // Ex: "vendas", "estoque"
    data: string // Data e hora do evento
  }
  retorno: {
    id: number // ID do recurso (ex: ID da venda, ID do produto)
    // Outros dados específicos do recurso
    [key: string]: any
  }
  // Outros campos do webhook
  [key: string]: any
}
