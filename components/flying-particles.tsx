"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface Particle {
  id: number
  left: string
  size: string
  duration: string
  delay: string
  opacity: string
  shape: "circle" | "square" | "diamond"
}

export function FlyingParticles() {
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isWakanda) {
      setParticles([]) // Limpa as partículas se o tema mudar para não-Wakanda
      return
    }

    const generateParticles = () => {
      const newParticles: Particle[] = []
      const numParticles = 50 // Número de partículas

      for (let i = 0; i < numParticles; i++) {
        const left = `${Math.random() * 100}vw`
        const size = `${Math.random() * 20 + 10}px` // Tamanho de 10px a 30px
        const duration = `${Math.random() * 15 + 10}s` // Duração da animação de 10s a 25s
        const delay = `-${Math.random() * 20}s` // Inicia em pontos diferentes
        const opacity = `${Math.random() * 0.3 + 0.1}` // Opacidade de 0.1 a 0.4
        const shapes: Particle["shape"][] = ["circle", "square", "diamond"]
        const shape = shapes[Math.floor(Math.random() * shapes.length)]

        newParticles.push({
          id: i,
          left,
          size,
          duration,
          delay,
          opacity,
          shape,
        })
      }
      setParticles(newParticles)
    }

    generateParticles()

    // Opcional: regenera as partículas ao redimensionar a janela para ajustar as posições
    const handleResize = () => generateParticles()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isWakanda])

  if (!isWakanda) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0" // z-0 para ficar atrás do conteúdo
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn(
            "absolute bottom-[-10%] bg-primary/50 animate-floatUp filter blur-[0.5px]", // Usa a cor primária do tema
            p.shape === "circle" && "rounded-full",
            p.shape === "square" && "rounded-none",
            p.shape === "diamond" && "rounded-sm rotate-45", // Pequenas bordas arredondadas para diamante
          )}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
