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
      setParticles([])
      return
    }

    const newParticles: Particle[] = []
    const numParticles = 50

    for (let i = 0; i < numParticles; i++) {
      const left = `${Math.random() * 100}%`
      const size = `${Math.random() * 20 + 10}px`
      const duration = `${Math.random() * 15 + 10}s`
      const delay = `-${Math.random() * 20}s`
      const opacity = `${Math.random() * 0.3 + 0.1}`
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
  }, [isWakanda])

  if (!isWakanda) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn(
            "absolute bottom-[-10%] bg-primary/50 animate-floatUp",
            p.shape === "circle" && "rounded-full",
            p.shape === "square" && "rounded-none",
            p.shape === "diamond" && "rounded-sm rotate-45"
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
