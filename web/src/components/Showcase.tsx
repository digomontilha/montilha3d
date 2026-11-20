"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = { slug: string | null; name: string; category: string; price: string | null; image: string | null };

const AUTOPLAY_MS = 6000;
const mod = (n: number, m: number) => ((n % m) + m) % m;

// Vitrine da home: peça central "sendo impressa" (revelada de baixo pra cima), vizinhas desfocadas,
// flutuação, parallax no mouse, troca por setas/teclado/arraste e autoplay.
export function Showcase({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => mod(x + d, n)), [n]);

  useEffect(() => {
    if (n < 2 || paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => !document.hidden && go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [n, paused, go, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go]);

  // Parallax: grava a posição do mouse em variáveis CSS (-1..1), uma vez por frame.
  const frame = useRef(0);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    });
  };

  const startX = useRef<number | null>(null);
  const cur = slides[i];
  const categories = [...new Set(slides.map((s) => s.category).filter(Boolean))];

  return (
    <section
      className="showcase relative mx-auto w-full max-w-7xl overflow-hidden px-5 pb-16 pt-6 md:px-10"
      aria-roledescription="carrossel"
      aria-label="Peças em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {categories.length > 0 && (
        <nav aria-label="Categorias" className="relative z-10 flex gap-4 overflow-x-auto [scrollbar-width:none] md:absolute md:left-10 md:top-10 md:block md:space-y-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setI(slides.findIndex((s) => s.category === c))}
              className={`block shrink-0 font-display text-2xl font-extrabold uppercase leading-[1.05] tracking-tight transition-colors md:text-4xl ${
                c === cur.category ? "text-foreground" : "text-outline hover:text-brand"
              }`}
              style={{ fontStretch: "62%" }}
              aria-current={c === cur.category}
            >
              {c}
            </button>
          ))}
          <span className="mt-4 hidden h-0.5 w-8 bg-foreground md:block" />
          <span className="mt-3 hidden font-mono text-xs text-muted md:block">Impressão 3D</span>
        </nav>
      )}

      <div
        ref={stage}
        className="stage relative mx-auto mt-6 h-[52vw] max-h-[460px] min-h-[260px] touch-pan-y select-none md:mt-0"
        onPointerMove={onMove}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        <span aria-hidden className="orb absolute left-[58%] top-[18%] h-16 w-16 rounded-full bg-brand/10 md:h-24 md:w-24" />
        {slides.map((s, k) => {
          const off = n > 2 ? ((k - i + n + 1) % n) - 1 : k - i; // -1 anterior, 0 atual, 1 próxima
          const pos = off === 0 ? "is-current" : off === -1 ? "is-prev" : off === 1 ? "is-next" : "is-hidden";
          return (
            <button
              key={s.slug ?? k}
              type="button"
              tabIndex={off === 0 ? -1 : 0}
              aria-hidden={off !== 0 && Math.abs(off) !== 1}
              aria-label={off === 0 ? undefined : `Ver ${s.name}`}
              onClick={() => off !== 0 && go(off)}
              className={`slide ${pos}`}
            >
              <span className="float block h-full w-full">
                <span key={off === 0 ? `print-${i}` : "idle"} className={`print relative block h-full w-full ${off === 0 ? "printing" : ""}`}>
                  {s.image ? (
                    <Image src={s.image} alt={off === 0 ? s.name : ""} fill sizes="(min-width:768px) 40vw, 70vw" className="object-contain" priority={k === 0} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/logo-mark.svg" alt={off === 0 ? s.name : ""} className="h-full w-full object-contain p-[12%]" />
                  )}
                </span>
              </span>
              <span aria-hidden className="drop" />
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-4 text-center" aria-live="polite">
        <h2 key={i} className="title font-display text-[clamp(3rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-tight" style={{ fontStretch: "62%" }}>
          {[...cur.name].map((ch, k) => (
            <span key={k} style={{ animationDelay: `${k * 35}ms` }}>{ch === " " ? " " : ch}</span>
          ))}
        </h2>
        <p className="mt-3 text-sm text-muted">
          {[cur.category, cur.price].filter(Boolean).join(" · ") || "Impressão 3D"}
        </p>
        {cur.slug ? (
          <Link href={`/produto/${cur.slug}`} className="mt-6 inline-block rounded-full bg-white px-7 py-3 font-mono text-xs uppercase tracking-widest shadow-sm transition hover:bg-brand hover:text-white">
            Ver peça
          </Link>
        ) : (
          <Link href="/loja" className="mt-6 inline-block rounded-full bg-white px-7 py-3 font-mono text-xs uppercase tracking-widest shadow-sm transition hover:bg-brand hover:text-white">
            Ver a loja
          </Link>
        )}
      </div>

      {n > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Peça anterior" className="arrow">←</button>
          <span className="font-mono text-xs tabular-nums text-muted">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Próxima peça" className="arrow">→</button>
        </div>
      )}
    </section>
  );
}
