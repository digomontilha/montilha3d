import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, getProduct } from "@/lib/products";

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: p.name, description: p.description.slice(0, 160) } : {};
}

async function Detail({ params }: { params: PageProps<"/produto/[slug]">["params"] }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="space-y-4 md:col-span-7">
        {p.images.length ? (
          p.images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] bg-line">
              <Image src={src} alt={`${p.name}, foto ${i + 1}`} fill priority={i === 0} sizes="(min-width:768px) 58vw, 100vw" className="object-cover" />
            </div>
          ))
        ) : (
          <div className="aspect-[4/5] bg-line" />
        )}
      </div>
      <div className="md:sticky md:top-8 md:col-span-4 md:col-start-9 md:self-start">
        <h1 className="font-display text-5xl font-extrabold leading-none tracking-tighter">{p.name}</h1>
        <p className="mt-5 font-mono text-xl">{formatPrice(p.price_cents)}</p>
        <p className="mt-8 whitespace-pre-line leading-relaxed text-muted">{p.description}</p>
        {p.buy_url ? (
          <a href={p.buy_url} target="_blank" rel="noopener noreferrer" className="mt-10 block bg-foreground px-6 py-4 text-center font-medium text-background hover:bg-brand">
            Comprar
          </a>
        ) : (
          <span aria-disabled="true" className="mt-10 block cursor-not-allowed border border-line px-6 py-4 text-center text-muted">Em breve</span>
        )}
      </div>
    </div>
  );
}

export default function Produto({ params }: PageProps<"/produto/[slug]">) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-6 md:px-10">
      <Link href="/loja" className="mb-8 inline-block text-sm text-muted hover:text-brand">&larr; Loja</Link>
      <Suspense fallback={<div className="h-screen" />}>
        <Detail params={params} />
      </Suspense>
    </section>
  );
}
