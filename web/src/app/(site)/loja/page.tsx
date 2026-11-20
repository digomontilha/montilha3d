import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyCatalog, ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Loja" };

async function Grid() {
  const items = await getProducts();
  if (!items.length) return <EmptyCatalog />;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3">
      {items.map((p, i) => (
        <div key={p.id} className={i % 3 === 1 ? "md:mt-16" : ""}>
          <ProductCard p={p} sizes="(min-width:768px) 33vw, 50vw" />
        </div>
      ))}
    </div>
  );
}

export default function Loja() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-10 md:px-10">
      <h1 className="mb-14 font-display text-6xl font-extrabold tracking-tighter md:text-8xl">Loja</h1>
      <Suspense fallback={<div className="h-96" />}>
        <Grid />
      </Suspense>
    </section>
  );
}
