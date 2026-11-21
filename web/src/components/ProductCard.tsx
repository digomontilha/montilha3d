import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

// "Em breve" quando o produto não tem link de compra (o painel só aceita https).
export const Availability = ({ p }: { p: Product }) =>
  p.buy_url ? (
    <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-700/30">Compra disponível</span>
  ) : (
    <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 ring-1 ring-amber-800/30">Em breve</span>
  );

// Card inteiro clicável pelo link do título (um só link por card para teclado e leitores de tela).
export function ProductCard({ p, wide = false, preload = false, sizes }: { p: Product; wide?: boolean; preload?: boolean; sizes: string }) {
  const price = formatPrice(p.price_cents);
  return (
    <article className={`group relative grid gap-5 ${wide ? "md:grid-cols-12 md:items-center md:gap-12" : ""}`}>
      <div className={`relative aspect-square overflow-hidden rounded-md bg-surface ${wide ? "md:col-span-6" : ""}`}>
        {p.images[0] && (
          <Image src={p.images[0]} alt={`Foto de ${p.name}`} fill sizes={sizes} preload={preload} className="object-contain transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
        )}
      </div>
      <div className={wide ? "md:col-span-6" : ""}>
        {p.category && <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted">{p.category}</p>}
        <h2 className={`font-display leading-[1.08] ${wide ? "text-[clamp(1.75rem,3.4vw,2.75rem)]" : "text-2xl"}`}>
          <Link href={`/produto/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand">
            {p.name}
          </Link>
        </h2>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {price && <span className={`font-bold text-brand ${wide ? "text-3xl md:text-4xl" : "text-xl"}`}>{price}</span>}
          <Availability p={p} />
        </p>
        <span aria-hidden className={`mt-5 inline-flex min-h-11 items-center rounded-md border-2 border-brand px-6 font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white ${wide ? "md:mt-7 md:text-lg" : ""}`}>
          Ver detalhes
        </span>
      </div>
    </article>
  );
}

export function EmptyCatalog({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="rounded-md border border-line px-6 py-16 text-center">
      <p className="font-display text-3xl">{filtered ? "Nenhuma peça nesta categoria." : "Nenhuma peça no catálogo agora."}</p>
      <p className="mt-3 text-muted">{filtered ? "Veja as outras peças do catálogo." : "Novas peças entram aqui assim que forem cadastradas."}</p>
      <Link href={filtered ? "/loja" : "/"} className="cta mt-8 bg-brand text-white hover:bg-foreground">
        {filtered ? "Ver todas as peças" : "Voltar ao início"}
      </Link>
    </div>
  );
}
