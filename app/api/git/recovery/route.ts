import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    let command = ""
    let description = ""

    switch (action) {
      case "soft-reset":
        command = "git reset --soft HEAD~1"
        description = "Desfaz o último commit mantendo as mudanças no staging"
        break

      case "hard-reset":
        command = "git reset --hard HEAD~1"
        description = "Desfaz o último commit e todas as mudanças (CUIDADO!)"
        break

      case "revert":
        command = "git revert --no-edit HEAD"
        description = "Cria um novo commit que desfaz o último commit"
        break

      case "stash":
        command = "git stash push -m 'Emergency stash'"
        description = "Salva mudanças não commitadas em stash"
        break

      case "checkout-previous":
        command = "git checkout HEAD~1 -- ."
        description = "Restaura todos os arquivos do commit anterior"
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Ação não reconhecida",
          },
          { status: 400 },
        )
    }

    console.log(`🔄 Executando: ${command}`)
    const { stdout, stderr } = await execAsync(command)

    return NextResponse.json({
      success: true,
      data: {
        action,
        description,
        command,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Erro na recuperação Git:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stderr: error.stderr || "",
      },
      { status: 500 },
    )
  }
}
