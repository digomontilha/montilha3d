import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ p, sizes = "(min-width:768px) 40vw, 100vw", priority = false }: { p: Product; sizes?: string; priority?: boolean }) {
  return (
    <Link href={`/produto/${p.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        {p.images[0] && (
          <Image src={p.images[0]} alt={p.name} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl font-bold tracking-tight group-hover:text-brand">{p.name}</h3>
        <span className="font-mono text-sm text-muted">{formatPrice(p.price_cents)}</span>
      </div>
    </Link>
  );
}

export function EmptyCatalog() {
  return (
    <p className="border-t border-line py-24 font-display text-4xl font-bold tracking-tight text-muted">Catálogo em breve.</p>
  );
}
