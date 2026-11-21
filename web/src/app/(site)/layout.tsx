import Link from "next/link";
import { Logo } from "@/components/LogoMark";
import { Suspense } from "react";
import { NavLinks, NavList } from "@/components/NavLinks";
import { INSTAGRAM } from "@/lib/site";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="border-b border-line">
        <nav aria-label="Principal" className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link href="/" aria-label="Montilha 3D, início" className="shrink-0"><Logo /></Link>
          <Suspense fallback={<NavList path="" />}><NavLinks /></Suspense>
        </nav>
      </header>
      <main id="conteudo" className="flex-1">{children}</main>
      <footer id="contato" className="mt-16 border-t md:mt-24 border-line">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 md:grid-cols-12 md:px-10">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-4 max-w-sm text-muted">Produtos 3D para decorar e presentear.</p>
            <Link href="/loja" className="mt-3 inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-4 hover:no-underline">
              Ver o catálogo
            </Link>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <h2 className="font-display text-2xl">Contato</h2>
            <p className="mt-2 text-muted">Fale com a gente e acompanhe as novidades no Instagram.</p>
            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-brand px-5 font-semibold text-brand hover:bg-brand hover:text-white"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              {INSTAGRAM.handle}<span className="sr-only"> no Instagram (abre em nova aba)</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
