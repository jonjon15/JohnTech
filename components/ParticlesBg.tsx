"use client";
import React, { useCallback, useEffect, useRef } from 'react';

function getParticleCount() {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 600) return 18;
    if (window.innerWidth < 900) return 32;
  }
  return 60;
}
const COLORS = [
  '#4f3fff', // Roxo premium
  '#00fff0', // Verde água
  '#00c3ff', // Azul claro
  '#2dffb4', // Verde neon
  '#7c3aed', // Roxo vibrante
  '#38bdf8', // Azul vibrante
  '#0ea5e9'  // Azul escuro
];

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

const ParticlesBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Inicializa partículas
    const count = getParticleCount();
    particles.current = Array.from({ length: count }, () => ({
      x: randomBetween(0, window.innerWidth),
      y: randomBetween(0, window.innerHeight),
      r: randomBetween(1.5, 4),
      dx: randomBetween(-0.7, 0.7),
      dy: randomBetween(-0.7, 0.7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    let animationId: number;
    let running = true;
    function animate() {
      if (!canvasRef.current || !running) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles.current) {
        ctx.save();
        ctx.filter = 'blur(0.5px)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.filter = 'none';
        ctx.restore();
        // Movimento mais fluido e rebote suave
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) {
          p.x = 0;
          p.dx *= -1 * randomBetween(0.8, 1.2);
        }
        if (p.x > canvas.width) {
          p.x = canvas.width;
          p.dx *= -1 * randomBetween(0.8, 1.2);
        }
        if (p.y < 0) {
          p.y = 0;
          p.dy *= -1 * randomBetween(0.8, 1.2);
        }
        if (p.y > canvas.height) {
          p.y = canvas.height;
          p.dy *= -1 * randomBetween(0.8, 1.2);
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    // Pausar animação quando aba não está visível
    function handleVisibility() {
      running = document.visibilityState === 'visible';
      if (running) animate();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resizeCanvas]);

  return (
    <>
      <div className="particles-bg">
        <canvas ref={canvasRef} className="particles-canvas" />
      </div>
      <div className="noise-overlay" />
    </>
  );
};

export default ParticlesBg;
