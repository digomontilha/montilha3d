import Link from "next/link";
import { Logo } from "@/components/LogoMark";
import { Suspense } from "react";
import { NavLinks, NavList } from "@/components/NavLinks";
import { INSTAGRAM, TIKTOK, WHATSAPP } from "@/lib/site";

const social = "inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-brand px-5 font-semibold text-brand hover:bg-brand hover:text-white";

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
            <p className="mt-2 text-muted">Fale com a gente pelo WhatsApp e acompanhe as novidades no Instagram e no TikTok.</p>
            <div className="mt-4 flex flex-wrap gap-3">
            <a href={WHATSAPP.link("Olá! Vim pelo site da Montilha 3D.")} target="_blank" rel="noopener noreferrer" className={social}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
                <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2-1.5 1Z" fill="currentColor" stroke="none" />
              </svg>
              WhatsApp<span className="sr-only"> (11) 91460-8191 (abre em nova aba)</span>
            </a>
            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className={social}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram<span className="sr-only"> {INSTAGRAM.handle} (abre em nova aba)</span>
            </a>
            <a href={TIKTOK.url} target="_blank" rel="noopener noreferrer" className={social}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.2 6.2 0 1 0 5.3 6.2V8.6a7.6 7.6 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4Z" />
              </svg>
              TikTok<span className="sr-only"> {TIKTOK.handle} (abre em nova aba)</span>
            </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
