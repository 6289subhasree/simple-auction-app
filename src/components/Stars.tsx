"use client";

import { useEffect, useRef } from "react";

export default function Stars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current!;
    const ctx = cvs.getContext("2d")!;
    let stars: { x: number; y: number; r: number; o: number; s: number }[] = [];
    let raf: number;

    const init = () => {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
      stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * cvs.width,
        y: Math.random() * cvs.height,
        r: Math.random() * 1.5 + 0.3,
        o: Math.random(),
        s: Math.random() * 0.003 + 0.001,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      stars.forEach((s) => {
        s.o += s.s;
        if (s.o > 1 || s.o < 0) s.s *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,222,${s.o * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}
