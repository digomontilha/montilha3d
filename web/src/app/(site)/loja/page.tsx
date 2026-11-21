import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyCatalog, ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Catálogo da Montilha 3D: produtos 3D para decorar e presentear, com fotos, preço e o que vem em cada peça.",
};

async function Grid({ searchParams }: { searchParams: PageProps<"/loja">["searchParams"] }) {
  const { categoria } = await searchParams;
  const all = await getProducts(); // já vem ordenado por Posição e nome
  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))];
  const selected = typeof categoria === "string" ? categoria : null;
  const items = selected ? all.filter((p) => p.category === selected) : all;

  return (
    <>
      <p className="mt-4 text-lg text-muted">
        {!all.length ? "" : items.length === 1 && !selected ? "Veja fotos, preço e o que vem na peça." : `${items.length} ${items.length === 1 ? "peça" : "peças"}${selected ? ` em ${selected}` : ""}. Escolha uma para ver fotos, preço e o que vem nela.`}
      </p>
      {categories.length > 1 && (
        <nav aria-label="Categorias" className="mt-8 flex flex-wrap gap-2">
          {[null, ...categories].map((c) => (
            <Link
              key={c ?? "todas"}
              href={c ? `/loja?categoria=${encodeURIComponent(c)}` : "/loja"}
              aria-current={c === selected ? "page" : undefined}
              className="rounded-full border border-line px-4 py-2 font-medium hover:border-brand hover:text-brand aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:text-white"
            >
              {c ?? "Todas"}
            </Link>
          ))}
        </nav>
      )}
      <div className="mt-8 border-t border-line pt-10">
        {!all.length ? (
          <EmptyCatalog />
        ) : !items.length ? (
          <EmptyCatalog filtered />
        ) : items.length === 1 ? (
          <ProductCard p={items[0]} wide preload sizes="(min-width:768px) 46vw, 100vw" />
        ) : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <li key={p.id}>
                <ProductCard p={p} preload={i === 0} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function Loja({ searchParams }: PageProps<"/loja">) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-10 md:px-10 md:pt-14">
      <h1 className="font-display text-5xl leading-none md:text-7xl">Catálogo</h1>
      <Suspense fallback={<div className="h-[60vh]" />}>
        <Grid searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
