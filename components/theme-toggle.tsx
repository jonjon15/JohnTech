"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Palette, Zap } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className={`
        relative overflow-hidden transition-all duration-300
        ${
          theme === "wakanda"
            ? "border-green-500/30 text-green-400 hover:bg-green-500/10 wakanda-border"
            : "border-white/20 text-white hover:bg-white/10"
        }
      `}
    >
      {theme === "wakanda" ? (
        <>
          <Zap className="h-4 w-4 mr-2" />
          Wakanda
        </>
      ) : (
        <>
          <Palette className="h-4 w-4 mr-2" />
          Default
        </>
      )}
    </Button>
  )
}
