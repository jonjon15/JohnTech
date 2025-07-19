/**
 * Tipos TypeScript para integração com Bling API v3
 * Baseado em: https://developer.bling.com.br/referencia
 */

// Tipos base para autenticação OAuth 2.0
export interface BlingAuthTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  expires_at?: Date
  scope?: string
}

export interface BlingAuthError {
  error: string
  error_description?: string
  error_uri?: string
}

// Tipos para produtos
export interface BlingProduct {
  id: number
  codigo?: string
  nome: string
  preco?: number
  precoCusto?: number
  unidade?: string
  pesoLiquido?: number
  pesoBruto?: number
  volumes?: number
  itensPorCaixa?: number
  gtin?: string
  gtinEmbalagem?: string
  tipo?: string
  situacao?: "Ativo" | "Inativo"
  formato?: "S" | "P" | "M"
  descricaoCurta?: string
  descricaoComplementar?: string
  linkExterno?: string
  observacoes?: string
  categoria?: {
    id: number
  }
  estoqueMinimo?: number
  estoqueMaximo?: number
  estoqueCrossdocking?: number
  estoqueLocalizacao?: string
  dimensoes?: {
    largura?: number
    altura?: number
    profundidade?: number
    unidadeMedida?: number
  }
  tributacao?: {
    origem?: number
    nFCI?: string
    ncm?: string
    cest?: string
    codigoListaServicos?: string
    spedTipoItem?: string
    codigoItem?: string
    percentualTributos?: number
    valorBaseStRetencao?: number
    valorStRetencao?: number
    valorICMSSubstituto?: number
    codigoExcecaoTipi?: string
    classeEnquadramentoIpi?: string
    codigoEnquadramentoIpi?: string
    controleLoteValidade?: string
    rastro?: string
    balanca?: string
    pesoVariavel?: string
    pis?: {
      aliquotaPercentual?: number
      situacaoTributaria?: string
    }
    cofins?: {
      aliquotaPercentual?: number
      situacaoTributaria?: string
    }
  }
  midia?: {
    video?: {
      url?: string
    }
    imagens?: {
      linkExterno?: string
    }[]
  }
  lojaVirtual?: {
    nomeProdutoLoja?: string
    descricaoProdutoLoja?: string
    produtoDestaque?: string
    descricaoComplementarLoja?: string
    linkExterno?: string
    ativo?: string
    titulo?: string
    palavrasChave?: string
    descricaoMetaTag?: string
    produtoVariacao?: string
    variacoes?: any[]
    estrutura?: {
      tipoEstrutura?: string
      lancamentoEstoque?: string
      componentes?: any[]
    }
    actionEstoque?: string
    tipoProducao?: string
    classe?: string
    seo?: {
      slug?: string
      titulo?: string
      descricao?: string
    }
  }
}

export interface BlingProductsResponse {
  data: BlingProduct[]
  pagina?: number
  limite?: number
  total?: number
}

// Tipos para pedidos
export interface BlingOrder {
  id: number
  numero: number
  numeroLoja?: string
  data: string
  dataSaida?: string
  dataPrevista?: string
  totalProdutos?: number
  totalVenda?: number
  situacao: {
    id: number
    valor: string
  }
  loja?: {
    id: number
  }
  numeroOrdemCompra?: string
  outrasDespesas?: number
  observacoes?: string
  observacoesInternas?: string
  desconto?: {
    valor?: number
    unidade?: string
  }
  categoria?: {
    id: number
  }
  tributacao?: {
    totalICMS?: number
    totalIPI?: number
    totalPIS?: number
    totalCOFINS?: number
    percentualTributos?: number
  }
  contato: {
    id: number
    nome: string
    numeroDocumento?: string
    telefone?: string
    email?: string
    endereco?: {
      endereco?: string
      numero?: string
      complemento?: string
      bairro?: string
      cep?: string
      municipio?: string
      uf?: string
      pais?: string
    }
  }
  vendedor?: {
    id: number
  }
  intermediador?: {
    nomeUsuario?: string
    cnpj?: string
    nomeContato?: string
  }
  transporte?: {
    fretePorConta?: string
    frete?: number
    quantidadeVolumes?: number
    pesoBruto?: number
    prazoEntrega?: number
    contato?: {
      id?: number
      nome?: string
      numeroDocumento?: string
      endereco?: any
    }
    etiqueta?: {
      nome?: string
      endereco?: string
      numero?: string
      complemento?: string
      municipio?: string
      uf?: string
      cep?: string
      bairro?: string
    }
    volumes?: any[]
  }
  itens: {
    id?: number
    codigo?: string
    unidade?: string
    quantidade: number
    valor: number
    produto: {
      id: number
      nome?: string
      codigo?: string
      preco?: number
      tipo?: string
    }
    comissao?: {
      base?: number
      aliquota?: number
      valor?: number
    }
    desconto?: {
      valor?: number
      unidade?: string
    }
  }[]
  parcelas?: {
    id?: number
    dataVencimento: string
    valor: number
    observacoes?: string
    formaPagamento?: {
      id: number
    }
  }[]
}

export interface BlingOrdersResponse {
  data: BlingOrder[]
  pagina?: number
  limite?: number
  total?: number
}

// Tipos para contatos
export interface BlingContact {
  id: number
  nome: string
  codigo?: string
  fantasia?: string
  tipo?: "F" | "J" | "E"
  contribuinte?: number
  cpfCnpj?: string
  ieRg?: string
  endereco?: {
    endereco?: string
    numero?: string
    complemento?: string
    bairro?: string
    cep?: string
    municipio?: string
    uf?: string
    pais?: string
    codigoMunicipio?: number
  }
  telefone?: string
  celular?: string
  email?: string
  site?: string
  situacao?: "A" | "I"
  nascimentoFundacao?: string
  limiteCredito?: number
  clienteDesde?: string
  observacoes?: string
  tags?: {
    tag?: string
  }[]
  vendedor?: {
    id: number
  }
}

export interface BlingContactsResponse {
  data: BlingContact[]
  pagina?: number
  limite?: number
  total?: number
}

// Tipos para estoque
export interface BlingStock {
  produto: {
    id: number
    nome?: string
    codigo?: string
  }
  deposito: {
    id: number
    nome?: string
  }
  saldoFisico?: number
  saldoVirtual?: number
  saldoVirtualTotal?: number
}

export interface BlingStockResponse {
  data: BlingStock[]
  pagina?: number
  limite?: number
  total?: number
}

// Tipos para webhooks
export interface BlingWebhookEvent {
  evento: "produto" | "pedido" | "estoque" | "contato" | "nfe"
  ocorrencia: "incluido" | "alterado" | "excluido"
  data: {
    id: number
    produto?: {
      id: number
    }
    deposito?: {
      id: number
    }
    [key: string]: any
  }
  timestamp?: string
}

// Tipos para erros da API
export interface BlingApiError {
  error: {
    type: string
    message: string
    description?: string
    code?: number
  }
}

// Tipos para respostas da API
export interface BlingApiResponse<T = any> {
  data?: T
  errors?: BlingApiError[]
  pagina?: number
  limite?: number
  total?: number
}

// Tipos para filtros de busca
export interface BlingSearchFilters {
  pagina?: number
  limite?: number
  criterio?: string
  dataInicial?: string
  dataFinal?: string
  situacao?: string
  idSituacao?: number
  idContato?: number
  idCategoria?: number
  codigo?: string
  tipo?: string
  [key: string]: any
}

// Tipos para configurações
export interface BlingConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  webhookSecret: string
  apiBaseUrl: string
  scopes: string[]
}

// Tipos para rate limiting
export interface BlingRateLimit {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// Tipos para logs
export interface BlingApiLog {
  id: number
  method: string
  url: string
  status: number
  requestBody?: string
  responseBody?: string
  duration: number
  timestamp: Date
  error?: string
}

// Tipos para sincronização
export interface BlingSyncStatus {
  lastSync: Date
  totalProducts: number
  totalOrders: number
  totalContacts: number
  errors: number
  status: "idle" | "syncing" | "error"
}

// Tipos para estatísticas
export interface BlingStats {
  produtos: {
    total: number
    ativos: number
    inativos: number
  }
  pedidos: {
    total: number
    hoje: number
    semana: number
    mes: number
  }
  contatos: {
    total: number
    clientes: number
    fornecedores: number
  }
  webhooks: {
    total: number
    processados: number
    pendentes: number
    erros: number
  }
}
