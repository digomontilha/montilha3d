import Link from "next/link";
import { Logo } from "@/components/LogoMark";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-6 font-mono text-xs uppercase tracking-widest md:px-10">
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/loja" className="hover:text-brand">Loja</Link>
          <Link href="/#como-e-feito" className="hidden hover:text-brand sm:inline">Sobre</Link>
        </nav>
        <Link href="/" aria-label="Montilha 3D, início" className="normal-case tracking-normal"><Logo /></Link>
        <nav className="flex justify-end">
          <Link href="/#contato" className="hover:text-brand">Contato</Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer id="contato" className="mt-32 border-t border-line">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 md:px-10">
          <p className="font-display text-3xl font-bold leading-tight tracking-tight md:col-span-6">
            Feito em pequenas tiragens,<br />uma camada de cada vez.
          </p>
          <p className="text-sm text-muted md:col-span-4 md:col-start-9">
            Dúvidas e encomendas: pela página de compra de cada peça.
            <br />
            <a href="https://montilha3d.com.br" className="mt-3 inline-block font-mono text-foreground hover:text-brand">montilha3d.com.br</a>
          </p>
        </div>
      </footer>
    </>
  );
}
