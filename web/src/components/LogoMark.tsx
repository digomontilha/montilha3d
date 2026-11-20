// Cubo da marca: arte vetorial em public/logo-mark.svg (gerada por brand/gerar-marca.mjs).
export function LogoMark({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno, next/image não agrega nada
  return <img src="/logo-mark.svg" alt="" className={className} width={34} height={38} />;
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-auto" />
      <span className="font-logo text-lg font-bold uppercase leading-none tracking-wide text-logo-ink sm:text-xl">
        Montilha<span className="text-accent">3</span><span className="text-logo-blue">D</span>
      </span>
    </span>
  );
}
