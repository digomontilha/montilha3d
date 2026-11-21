import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Availability, ProductCard } from "@/components/ProductCard";
import { formatPrice, getFeatured, getProducts, getSettings } from "@/lib/products";

// Vitrine: produtos com "Destaque na home"; sem nenhum, os primeiros ativos por Posição (comportamento anterior).
async function Vitrine() {
  const [s, featured] = await Promise.all([getSettings(), getFeatured()]);
  const items = featured.length ? featured : (await getProducts()).slice(0, 8);
  const spot = items.find((p) => p.images[0]) ?? items[0]; // peça protagonista: a primeira com foto
  const image = spot?.images[0] ?? s.hero_image; // sem foto de produto, usa a imagem principal do painel Home
  const rest = items.filter((p) => p !== spot);
  const price = spot && formatPrice(spot.price_cents);

  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pt-8 md:grid-cols-12 md:gap-12 md:px-10 md:pt-14">
        <div className={image ? "md:col-span-6" : "md:col-span-8"}>
          <h1 className="font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.02] [text-wrap:balance]">{s.hero_title}</h1>
          {s.hero_subtitle && <p className="mt-5 max-w-md text-lg text-muted">{s.hero_subtitle}</p>}
          <Link href="/loja" className="cta mt-7 md:mt-9 bg-brand text-white hover:bg-foreground">Ver catálogo</Link>
        </div>
        {image && (
          <figure className="md:col-span-6">
            <div className="relative aspect-square overflow-hidden rounded-md bg-surface">
              <Image src={image} alt={spot ? `Foto de ${spot.name}` : "Peça da Montilha 3D"} fill preload sizes="(min-width:768px) 46vw, 100vw" className="object-contain" />
            </div>
            {spot && (
              <figcaption className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                <span>
                  <span className="block font-display text-2xl leading-tight">{spot.name}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {price && <span className="text-xl font-bold text-brand">{price}</span>}
                    <Availability p={spot} />
                  </span>
                </span>
                <Link href={`/produto/${spot.slug}`} className="inline-flex min-h-11 items-center rounded-md border-2 border-brand px-6 font-semibold text-brand hover:bg-brand hover:text-white">
                  Ver detalhes<span className="sr-only">: {spot.name}</span>
                </Link>
              </figcaption>
            )}
          </figure>
        )}
      </section>

      {rest.length > 0 && (
        <section aria-labelledby="destaques" className="mx-auto mt-24 w-full max-w-7xl px-5 md:px-10">
          <div className="flex items-end justify-between gap-6 border-t border-line pt-10">
            <h2 id="destaques" className="font-display text-4xl md:text-5xl">Mais peças</h2>
            <Link href="/loja" className="font-medium text-brand underline underline-offset-4 hover:no-underline">Ver catálogo completo</Link>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 3).map((p) => (
              <li key={p.id}><ProductCard p={p} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" /></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

const steps = [
  ["Escolha a peça", "Navegue pelo catálogo e abra a página de cada item."],
  ["Confira os detalhes", "Fotos, preço e o que vem em cada peça ficam na mesma página."],
  ["Compre pela página da peça", "Quando a venda abrir, use o botão Comprar na página da peça."],
];

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-[80vh]" />}>
        <Vitrine />
      </Suspense>

      <section aria-labelledby="como-comprar" className="mx-auto mt-14 md:mt-24 w-full max-w-7xl px-5 md:px-10">
        <h2 id="como-comprar" className="border-t border-line pt-10 font-display text-4xl md:text-5xl">Como comprar</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {steps.map(([title, text], i) => (
            <li key={title}>
              <span aria-hidden className="font-display text-3xl text-brand">{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
