export interface Cliente {
  id?: number
  bling_id?: number
  nome: string
  email?: string
  telefone?: string
  celular?: string
  documento?: string
  tipo_pessoa?: "F" | "J"
  inscricao_estadual?: string
  inscricao_municipal?: string
  nome_fantasia?: string
  endereco_logradouro?: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cep?: string
  endereco_cidade?: string
  endereco_uf?: string
  endereco_pais?: string
  observacoes?: string
  situacao?: string
  created_at?: Date
  updated_at?: Date
}

export interface Pedido {
  id?: number
  bling_id?: number
  numero?: string
  numero_loja?: string
  cliente_id?: number
  cliente?: Cliente
  data_pedido: Date
  data_saida?: Date
  data_prevista?: Date
  situacao: string
  total_produtos: number
  total_desconto: number
  total_frete: number
  total_geral: number
  observacoes?: string
  observacoes_internas?: string
  vendedor?: string
  forma_pagamento?: string
  condicao_pagamento?: string
  transportadora?: string
  frete_por_conta?: string
  peso_bruto?: number
  quantidade_volumes?: number
  prazo_entrega?: number
  itens?: PedidoItem[]
  parcelas?: PedidoParcela[]
  created_at?: Date
  updated_at?: Date
}

export interface PedidoItem {
  id?: number
  pedido_id?: number
  produto_id?: number
  bling_produto_id?: number
  codigo_produto?: string
  nome_produto: string
  quantidade: number
  valor_unitario: number
  valor_desconto: number
  valor_total: number
  aliquota_ipi?: number
  observacoes?: string
  created_at?: Date
  updated_at?: Date
}

export interface PedidoParcela {
  id?: number
  pedido_id?: number
  numero_parcela: number
  data_vencimento: Date
  valor: number
  forma_pagamento?: string
  observacoes?: string
  situacao?: string
  created_at?: Date
  updated_at?: Date
}

export interface PedidoHistorico {
  id?: number
  pedido_id?: number
  situacao_anterior?: string
  situacao_nova: string
  observacoes?: string
  usuario?: string
  data_alteracao?: Date
}

export interface CreatePedidoRequest {
  cliente: Partial<Cliente>
  data_pedido?: Date
  data_prevista?: Date
  observacoes?: string
  observacoes_internas?: string
  vendedor?: string
  forma_pagamento?: string
  condicao_pagamento?: string
  transportadora?: string
  frete_por_conta?: string
  peso_bruto?: number
  quantidade_volumes?: number
  prazo_entrega?: number
  itens: Array<{
    produto_id?: number
    codigo_produto?: string
    nome_produto: string
    quantidade: number
    valor_unitario: number
    valor_desconto?: number
    aliquota_ipi?: number
    observacoes?: string
  }>
  parcelas?: Array<{
    numero_parcela: number
    data_vencimento: Date
    valor: number
    forma_pagamento?: string
    observacoes?: string
  }>
}

export interface PedidoFilters {
  cliente_id?: number
  situacao?: string
  data_inicio?: Date
  data_fim?: Date
  vendedor?: string
  forma_pagamento?: string
  page?: number
  limit?: number
}

export interface PedidoStats {
  total_pedidos: number
  total_vendas: number
  ticket_medio: number
  pedidos_em_aberto: number
  pedidos_faturados: number
  pedidos_cancelados: number
  vendas_mes_atual: number
  vendas_mes_anterior: number
  crescimento_percentual: number
}
