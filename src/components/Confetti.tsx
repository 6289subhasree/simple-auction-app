"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#A855F7","#EC4899","#8B5CF6","#C084FC","#F0ABFC","#7C3AED","#FBBF24"];

export function useConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  const fire = () => {
    const c = containerRef.current;
    if (!c) return;
    for (let i = 0; i < 70; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;top:-20px;border-radius:2px;
        left:${Math.random() * 100}vw;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        animation:fall ${0.8 + Math.random() * 1.6}s linear ${Math.random() * 0.6}s forwards;
      `;
      c.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }
  };

  return { containerRef, fire };
}

export default function ConfettiContainer({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />;
}
