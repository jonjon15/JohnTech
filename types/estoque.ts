export interface EstoqueItem {
  id?: number
  produto_id: number
  deposito_id: number
  bling_produto_id?: number
  bling_deposito_id?: number
  quantidade_fisica: number
  quantidade_virtual: number
  quantidade_disponivel: number
  quantidade_minima?: number
  quantidade_maxima?: number
  custo_medio: number
  valor_total: number
  localizacao?: string
  data_ultima_movimentacao?: Date
  created_at?: Date
  updated_at?: Date
  // Campos extras para joins
  produto_nome?: string
  produto_codigo?: string
  deposito_nome?: string
}

export interface MovimentacaoEstoque {
  id?: number
  produto_id: number
  deposito_id: number
  tipo_movimentacao: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE" | "INVENTARIO"
  quantidade: number
  quantidade_anterior: number
  quantidade_nova: number
  custo_unitario: number
  valor_total: number
  motivo?: string
  documento?: string
  usuario_id?: string
  observacoes?: string
  created_at?: Date
  // Campos extras para joins
  produto_nome?: string
  produto_codigo?: string
  deposito_nome?: string
}

export interface Deposito {
  id?: number
  bling_id?: number
  nome: string
  descricao?: string
  endereco?: string
  ativo: boolean
  padrao: boolean
  created_at?: Date
  updated_at?: Date
}

export interface AlertaEstoque {
  id?: number
  produto_id: number
  deposito_id: number
  tipo_alerta: "ESTOQUE_BAIXO" | "ESTOQUE_ZERADO" | "ESTOQUE_NEGATIVO"
  quantidade_atual: number
  quantidade_minima: number
  data_alerta: Date
  resolvido: boolean
  created_at?: Date
  // Campos extras para joins
  produto_nome?: string
  produto_codigo?: string
  deposito_nome?: string
}

export interface RelatorioEstoque {
  produto_id: number
  produto_nome: string
  produto_codigo: string
  deposito_id: number
  deposito_nome: string
  quantidade_fisica: number
  quantidade_virtual: number
  quantidade_disponivel: number
  quantidade_minima: number
  valor_unitario: number
  valor_total: number
  status: "OK" | "BAIXO" | "ZERADO" | "NEGATIVO"
  dias_sem_movimentacao: number
}

export interface SyncEstoqueResult {
  success: boolean
  processados: number
  sincronizados: number
  erros: number
  alertas_criados: number
  detalhes: Array<{
    produto_id: number
    produto_nome: string
    status: "sucesso" | "erro"
    erro?: string
  }>
}
