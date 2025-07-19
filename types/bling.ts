/**
 * Tipos baseados na documentação oficial do Bling API v3
 * https://developer.bling.com.br/referencia
 */

// Token Data para OAuth 2.0
export interface BlingTokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  scope: string
  expiresAt: string
}

// Estrutura de erro da API Bling
export interface BlingApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

// Resposta padronizada da API
export interface BlingApiResponse<T> {
  success: boolean
  data: T | null
  error: BlingApiError | null
}

// Produto conforme documentação Bling
export interface BlingProduct {
  id: number
  nome: string
  codigo?: string
  preco?: number
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
  condicao?: 0 | 1 | 2 | 3 | 4 | 5
  freteGratis?: boolean
  marca?: string
  descricaoFornecedor?: string
  categoria?: {
    id: number
    descricao?: string
  }
  estoque?: {
    minimo?: number
    maximo?: number
    crossdocking?: number
    localizacao?: string
  }
  tributacao?: {
    origem?: number
    nfci?: string
    ncm?: string
    cest?: string
    codigoListaServicos?: string
    spedTipoItem?: string
    codigoItem?: string
    percentualTributos?: number
  }
  imagens?: Array<{
    linkExterno: string
  }>
  variacao?: {
    nome: string
    ordem: number
    produtoPai: {
      id: number
    }
    variacao: Array<{
      nome: string
      valor: string
    }>
  }
}

// Pedido conforme documentação Bling
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
    tipoPessoa?: "F" | "J"
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
    fretePorConta?: 0 | 1 | 2
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
  tipos?: Array<"C" | "F" | "T" | "V">
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

// Categoria
export interface BlingCategory {
  id: number
  descricao: string
  categoriaPai?: {
    id: number
  }
}

// Webhook Event
export interface BlingWebhookEvent {
  evento?: {
    tipo: string
    data?: string
  }
  retorno?: {
    id?: number | string
    [key: string]: any
  }
  [key: string]: any
}

// Requests para criação/atualização
export interface CreateProductRequest extends Omit<BlingProduct, "id"> {}
export interface UpdateProductRequest extends Partial<Omit<BlingProduct, "id">> {}
export interface CreateOrderRequest extends Omit<BlingOrder, "id" | "numero"> {}

// Token armazenado no banco
export interface StoredToken {
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: Date
  created_at: Date
  updated_at: Date
}
