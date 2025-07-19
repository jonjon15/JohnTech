"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, GitBranch, Clock, FileText, RotateCcw } from "lucide-react"

interface GitStatus {
  currentBranch: string
  lastCommit: string
  hasUncommittedChanges: boolean
  uncommittedFiles: string[]
  timestamp: string
}

export default function GitRecoveryPage() {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<any>(null)

  useEffect(() => {
    fetchGitStatus()
  }, [])

  const fetchGitStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/git/status")
      const data = await response.json()

      if (data.success) {
        setGitStatus(data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar status do Git:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string) => {
    try {
      setActionLoading(action)
      const response = await fetch("/api/git/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      setLastAction(data)

      // Atualiza o status após a ação
      await fetchGitStatus()
    } catch (error) {
      console.error("Erro ao executar ação:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const recoveryOptions = [
    {
      id: "soft-reset",
      title: "Reset Suave",
      description: "Desfaz o último commit mas mantém as mudanças no staging",
      icon: <RotateCcw className="h-4 w-4" />,
      danger: false,
    },
    {
      id: "revert",
      title: "Reverter Commit",
      description: "Cria um novo commit que desfaz o último commit",
      icon: <GitBranch className="h-4 w-4" />,
      danger: false,
    },
    {
      id: "stash",
      title: "Salvar em Stash",
      description: "Salva mudanças não commitadas temporariamente",
      icon: <FileText className="h-4 w-4" />,
      danger: false,
    },
    {
      id: "checkout-previous",
      title: "Restaurar Arquivos",
      description: "Restaura todos os arquivos do commit anterior",
      icon: <Clock className="h-4 w-4" />,
      danger: true,
    },
    {
      id: "hard-reset",
      title: "Reset Completo",
      description: "CUIDADO: Desfaz commit e perde todas as mudanças",
      icon: <AlertTriangle className="h-4 w-4" />,
      danger: true,
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verificando status do Git...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Recuperação Git</h1>
        <p className="text-muted-foreground">Ferramentas para reverter ou corrigir mudanças no repositório</p>
      </div>

      {/* Status Atual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Status Atual do Repositório
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gitStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Branch Atual</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{gitStatus.currentBranch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Último Commit</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{gitStatus.lastCommit}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-2">
                  <Badge variant={gitStatus.hasUncommittedChanges ? "destructive" : "default"}>
                    {gitStatus.hasUncommittedChanges ? "Mudanças não commitadas" : "Repositório limpo"}
                  </Badge>
                </div>
              </div>

              {gitStatus.hasUncommittedChanges && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Arquivos Modificados</label>
                  <div className="mt-2 space-y-1">
                    {gitStatus.uncommittedFiles.map((file, index) => (
                      <p key={index} className="font-mono text-sm bg-muted p-2 rounded">
                        {file}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <Button onClick={fetchGitStatus} variant="outline" size="sm">
              🔄 Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Última Ação */}
      {lastAction && (
        <Alert className={`mb-6 ${lastAction.success ? "border-green-200" : "border-red-200"}`}>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {lastAction.success ? "✅ Ação executada com sucesso" : "❌ Erro na execução"}
              </p>
              {lastAction.data && (
                <div className="text-sm">
                  <p>
                    <strong>Comando:</strong> <code>{lastAction.data.command}</code>
                  </p>
                  <p>
                    <strong>Descrição:</strong> {lastAction.data.description}
                  </p>
                  {lastAction.data.stdout && (
                    <p>
                      <strong>Output:</strong> <code>{lastAction.data.stdout}</code>
                    </p>
                  )}
                </div>
              )}
              {lastAction.error && <p className="text-red-600 text-sm">{lastAction.error}</p>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Opções de Recuperação */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Recuperação</CardTitle>
          <CardDescription>
            Escolha uma ação para corrigir o problema. Ações marcadas como perigosas podem causar perda de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {recoveryOptions.map((option, index) => (
              <div key={option.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {option.title}
                        {option.danger && (
                          <Badge variant="destructive" className="text-xs">
                            PERIGOSO
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => executeAction(option.id)}
                    variant={option.danger ? "destructive" : "default"}
                    disabled={actionLoading !== null}
                    className="min-w-[100px]"
                  >
                    {actionLoading === option.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Executando...
                      </div>
                    ) : (
                      "Executar"
                    )}
                  </Button>
                </div>
                {index < recoveryOptions.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comandos Manuais */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comandos Manuais</CardTitle>
          <CardDescription>Se preferir, você pode executar estes comandos diretamente no terminal:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Ver histórico de commits:</p>
              <code className="block bg-muted p-2 rounded text-sm">git log --oneline -10</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Desfazer último commit (mantendo mudanças):</p>
              <code className="block bg-muted p-2 rounded text-sm">git reset --soft HEAD~1</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Criar commit que reverte o último:</p>
              <code className="block bg-muted p-2 rounded text-sm">git revert HEAD</code>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Ver diferenças do último commit:</p>
              <code className="block bg-muted p-2 rounded text-sm">git diff HEAD~1</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
