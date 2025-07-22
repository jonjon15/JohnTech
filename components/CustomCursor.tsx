"use client";
import React, { useEffect, useRef } from 'react';

// SVG do mini mouse igual ao print
const MiniMouseSVG = () => (
  <svg className="cursor-svg" width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Oval branco com glow e sem transparência */}
    <ellipse
      cx="14" cy="19" rx="11" ry="17"
      fill="#181c2b"
      stroke="none"
      filter="url(#glow-neon)"
    />
    {/* Dois pontos animados na ponta superior para simular scroll real */}
    <circle cx="14" r="1.2" fill="white">
      <animate attributeName="cy" values="4;8;4" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="14" r="1.2" fill="white">
      <animate attributeName="cy" values="8;12;8" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
    </circle>
    {/* Traço central encostando no ponto animado */}
    <rect x="13.1" y="12" width="1.8" height="5" rx="0.9" fill="white" />
    <defs>
      <filter id="glow-neon" x="-6" y="-6" width="40" height="50" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#fffbe6" floodOpacity="0.7" />
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#fffbe6" floodOpacity="0.45" />
        <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#fffbe6" floodOpacity="1.5" />
      </filter>
    </defs>
  </svg>
);

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Ajuste de deslocamento: +25px direita, +25px baixo
    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX - 14 + 25}px, ${e.clientY - 19 + 25}px, 0)`;
    };

    const addHover = () => cursor.classList.add('cursor-hover');
    const removeHover = () => cursor.classList.remove('cursor-hover');
    const addClick = () => cursor.classList.add('cursor-click');
    const removeClick = () => cursor.classList.remove('cursor-click');

    document.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('button, a, .primary-btn, .refresh-btn, .search-btn, .pagination-btn, .connect-bling-btn, .nav-link, .dashboard-card, .modal, .modal-content').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });
    document.addEventListener('mousedown', addClick);
    document.addEventListener('mouseup', removeClick);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll('button, a, .primary-btn, .refresh-btn, .search-btn, .pagination-btn, .connect-bling-btn, .nav-link, .dashboard-card, .modal, .modal-content').forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
      document.removeEventListener('mousedown', addClick);
      document.removeEventListener('mouseup', removeClick);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor">
      <MiniMouseSVG />
    </div>
  );
};

export default CustomCursor;
