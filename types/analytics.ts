export interface RelatorioVendas {
  id?: number
  periodo_inicio: Date
  periodo_fim: Date
  total_vendas: number
  total_pedidos: number
  ticket_medio: number
  produtos_vendidos: number
  clientes_ativos: number
  vendedor?: string
  categoria?: string
  created_at?: Date
}

export interface MetricaDiaria {
  id?: number
  data_referencia: Date
  vendas_total: number
  pedidos_total: number
  pedidos_novos: number
  pedidos_faturados: number
  pedidos_cancelados: number
  clientes_novos: number
  produtos_vendidos: number
  ticket_medio: number
  created_at?: Date
}

export interface AlertaSistema {
  id?: number
  tipo: string
  titulo: string
  descricao?: string
  severidade: "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  lido: boolean
  resolvido: boolean
  data_criacao?: Date
  data_resolucao?: Date
  usuario_responsavel?: string
  metadados?: Record<string, any>
}

export interface DashboardData {
  vendas_hoje: number
  vendas_mes: number
  pedidos_pendentes: number
  estoque_baixo: number
  crescimento_vendas: number
  top_produtos: Array<{
    nome: string
    quantidade: number
    valor: number
  }>
  vendas_por_dia: Array<{
    data: string
    valor: number
    pedidos: number
  }>
  alertas_recentes: AlertaSistema[]
}

export interface RelatorioFiltros {
  data_inicio?: Date
  data_fim?: Date
  vendedor?: string
  cliente_id?: number
  categoria?: string
  situacao?: string
}
