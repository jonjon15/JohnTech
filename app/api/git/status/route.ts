import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Verifica status do Git
    const { stdout: status } = await execAsync("git status --porcelain")
    const { stdout: lastCommit } = await execAsync("git log -1 --oneline")
    const { stdout: branch } = await execAsync("git branch --show-current")

    return NextResponse.json({
      success: true,
      data: {
        currentBranch: branch.trim(),
        lastCommit: lastCommit.trim(),
        hasUncommittedChanges: status.trim().length > 0,
        uncommittedFiles: status
          .trim()
          .split("\n")
          .filter((line) => line.length > 0),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
