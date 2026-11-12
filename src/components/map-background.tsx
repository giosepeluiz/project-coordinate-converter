"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo decorativo de mapa (SVG local, ~poucos KB) com parallax suave.
 * O movimento do mouse escreve variáveis CSS direto no elemento via
 * requestAnimationFrame — sem re-render do React. Desativado em telas de toque
 * e para quem prefere movimento reduzido.
 */
export function MapBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const allowed = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!allowed.matches) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        el.style.setProperty("--my", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-gray-950">
      <div ref={ref} className="map-parallax absolute -inset-[8%]">
        <div className="animate-slow-pan absolute inset-0 bg-[url('/assets/map-bg.svg')] bg-cover bg-center opacity-50 dark:opacity-25 dark:invert dark:hue-rotate-180" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/60 dark:from-gray-950/50 dark:via-gray-950/20 dark:to-gray-950/70" />
    </div>
  );
}
